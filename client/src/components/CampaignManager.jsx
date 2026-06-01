import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import useFetch from '../hooks/useFetch'

const CampaignManager = () => {
  const { data: campaigns, loading: campaignsLoading } = useFetch('http://localhost:4000/api/campaigns', 'GET')
  const [message, setMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [localCampaigns, setLocalCampaigns] = useState(campaigns)

  useEffect(() => {
    if (campaigns) setLocalCampaigns(campaigns)
  }, [campaigns])

  const summary = useMemo(() => {
    const items = localCampaigns || []
    return {
      total: items.length,
      active: items.filter((item) => item.status === 'active').length,
      completed: items.filter((item) => item.status === 'completed').length,
      inactive: items.filter((item) => item.status === 'inactive').length,
    }
  }, [localCampaigns])

  const handleStatusChange = async (campaignId, newStatus) => {
    setMessage(null)
    setUpdatingId(campaignId)

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      const updated = await res.json()
      setLocalCampaigns((prev) => prev.map((c) => (c._id === campaignId ? updated : c)))
      setMessage({ type: 'success', text: `Campaign status updated to ${newStatus}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to update campaign.' })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    setMessage(null)

    if (!window.confirm('Delete this campaign? This cannot be undone.')) {
      return
    }

    setUpdatingId(campaignId)

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${campaignId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete campaign')

      setLocalCampaigns((prev) => prev.filter((c) => c._id !== campaignId))
      setMessage({ type: 'success', text: 'Campaign deleted.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to delete campaign.' })
    } finally {
      setUpdatingId(null)
    }
  }

  const statusClasses = (status) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700'
    if (status === 'completed') return 'bg-sky-100 text-sky-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Campaign manager</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Track campaigns in one place</h2>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 text-center">
              <p className="text-sm text-slate-500">Active</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">{summary.active}</p>
            </div>
            <div className="rounded-3xl bg-sky-50 p-4 text-center">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-sky-700">{summary.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      {campaignsLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading campaigns...
        </div>
      ) : localCampaigns && localCampaigns.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {localCampaigns.map((campaign) => (
            <div key={campaign._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{campaign.name}</h3>
                    {campaign.description && <p className="text-sm text-slate-500">{campaign.description}</p>}
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClasses(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Progress</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{campaign.progress ?? 0}%</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Lead count</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{campaign.leads?.length ?? 0}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {campaign.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(campaign._id, 'active')}
                        disabled={updatingId === campaign._id}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {updatingId === campaign._id ? 'Updating…' : 'Activate'}
                      </button>
                    )}
                    {campaign.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(campaign._id, 'inactive')}
                        disabled={updatingId === campaign._id}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {updatingId === campaign._id ? 'Updating…' : 'Pause'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      disabled={updatingId === campaign._id}
                      className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {updatingId === campaign._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                  <Link
                    to={`/campaigns/${campaign._id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No campaigns yet</p>
          <p className="mt-3">Create a campaign to see it appear here, then manage status and progress from the dashboard.</p>
        </div>
      )}
    </div>
  )
}

export default CampaignManager
