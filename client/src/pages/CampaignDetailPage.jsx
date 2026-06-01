import { Link, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'

const CampaignDetailPage = () => {
  const { id } = useParams()
  const { data: campaign, loading, error } = useFetch(`http://localhost:4000/api/campaign/${id}`, 'GET')
  const [currentCampaign, setCurrentCampaign] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (campaign) setCurrentCampaign(campaign)
  }, [campaign])

  const handleToggleStatus = async () => {
    if (!currentCampaign) return
    setStatusMessage(null)
    setUpdating(true)

    const newStatus = currentCampaign.status === 'active' ? 'inactive' : 'active'

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Unable to update status')
      const updated = await res.json()
      setCurrentCampaign(updated)
      setStatusMessage({ type: 'success', text: `Campaign ${newStatus === 'active' ? 'started' : 'paused'} successfully.` })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Status update failed.' })
    } finally {
      setUpdating(false)
    }
  }

  const actionLabel = currentCampaign?.status === 'active' ? 'Pause campaign' : 'Start campaign'
  const statusBadge = (status) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700'
    if (status === 'completed') return 'bg-sky-100 text-sky-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Campaign detail</p>
          <h2 className="text-2xl font-semibold text-slate-900">Campaign overview</h2>
        </div>
        <Link
          to="/campaigns"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Back to campaigns
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">Loading campaign…</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">Unable to load campaign.</div>
      ) : !currentCampaign ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">Campaign not found.</div>
      ) : (
        <div className="space-y-6">
          {statusMessage && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${statusMessage.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-emerald-50 text-emerald-700'}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <h3 className="text-3xl font-semibold text-slate-900">{currentCampaign.name}</h3>
                <p className="mt-3 text-slate-600">{currentCampaign.description || 'No campaign description available.'}</p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <span className={`inline-flex items-center rounded-3xl px-4 py-2 text-sm font-semibold ${statusBadge(currentCampaign.status)}`}>
                  Status: <span className="ml-2 text-slate-900">{currentCampaign.status}</span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {updating ? 'Saving…' : actionLabel}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{currentCampaign.progress ?? 0}%</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Lead count</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{currentCampaign.leads?.length ?? 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Created</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{currentCampaign.createdAt ? new Date(currentCampaign.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Campaign message</h4>
              <p className="mt-3 whitespace-pre-line text-slate-700">{currentCampaign.message || 'No message provided.'}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Selected leads</h4>
              {currentCampaign.leads && currentCampaign.leads.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentCampaign.leads.map((lead) => (
                    <span key={lead._id || lead.id || lead.name} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{lead.name || lead.email || 'Lead'}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">No leads selected for this campaign.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDetailPage
