import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import useFetch from '../hooks/useFetch'
import ScheduleModal from './ScheduleModal'
import DeleteCampaignModal from './DeleteCampaignModal'
import { apiFetch } from '../utils/api'

const CampaignManager = () => {
  const { data: campaigns, loading: campaignsLoading, error: campaignsError } = useFetch('http://localhost:4000/api/campaigns', 'GET')
  const [message, setMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [localCampaigns, setLocalCampaigns] = useState([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleCampaignTarget, setScheduleCampaignTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLocalCampaigns(Array.isArray(campaigns) ? campaigns : [])
  }, [campaigns])

  const openScheduleModal = (campaign) => {
    setScheduleCampaignTarget(campaign)
    setScheduleModalOpen(true)
  }

  const closeScheduleModal = () => {
    setScheduleCampaignTarget(null)
    setScheduleModalOpen(false)
  }

  const openDeleteModal = (campaign) => {
    setDeleteCampaignTarget(campaign)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setDeleteCampaignTarget(null)
    setDeleteModalOpen(false)
  }

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignTarget) return
    const campaignId = deleteCampaignTarget._id

    setMessage(null)
    setDeleting(true)
    setUpdatingId(campaignId)

    try {
      const res = await apiFetch(`http://localhost:4000/api/campaign/${campaignId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete campaign')

      setLocalCampaigns((prev) => prev.filter((c) => c._id !== campaignId))
      setMessage({ type: 'success', text: 'Campaign deleted.' })
      setDeleteModalOpen(false)
      setDeleteCampaignTarget(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to delete campaign.' })
    } finally {
      setDeleting(false)
      setUpdatingId(null)
    }
  }

  const handleScheduled = (updated) => {
    setLocalCampaigns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
    setMessage({ type: 'success', text: 'Campaign scheduled successfully.' })
  }

  const summary = useMemo(() => {
    const items = Array.isArray(localCampaigns) ? localCampaigns : []
    return {
      total: items.length,
      active: items.filter((item) => item.status === 'active').length,
      scheduled: items.filter((item) => item.status === 'scheduled').length,
      completed: items.filter((item) => item.status === 'completed').length,
      inactive: items.filter((item) => item.status === 'inactive').length,
    }
  }, [localCampaigns])

  const handleStatusChange = async (campaignId, newStatus) => {
    setMessage(null)
    setUpdatingId(campaignId)

    try {
      const res = await apiFetch(`http://localhost:4000/api/campaign/${campaignId}/status`, {
        method: 'PATCH',
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

  const statusClasses = (status) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700'
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700'
    if (status === 'completed') return 'bg-sky-100 text-sky-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: summary.total, color: 'bg-slate-50 text-slate-900' },
          { label: 'Active', value: summary.active, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Scheduled', value: summary.scheduled, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Completed', value: summary.completed, color: 'bg-violet-50 text-violet-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-4 text-center ${stat.color}`}>
            <p className="text-xs uppercase tracking-wider font-medium opacity-60">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      {campaignsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {campaignsError.error || campaignsError.message || 'Unable to load campaigns. Try signing in again.'}
        </div>
      )}

      {campaignsLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : Array.isArray(localCampaigns) && localCampaigns.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {localCampaigns.map((campaign) => (
            <div key={campaign._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5">
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
                  {campaign.status === 'scheduled' && campaign.scheduledAt && (
                    <div className="rounded-3xl bg-blue-50 p-4 sm:col-span-2">
                      <p className="text-sm text-blue-500">Scheduled for</p>
                      <p className="mt-2 text-xl font-semibold text-blue-700">{new Date(campaign.scheduledAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {campaign.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(campaign._id, 'active')}
                        disabled={updatingId === campaign._id}
                        className="btn-primary flex-1 py-2.5 text-xs disabled:opacity-50"
                      >
                        {updatingId === campaign._id ? 'Updating…' : 'Activate'}
                      </button>
                    )}
                    {campaign.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(campaign._id, 'inactive')}
                        disabled={updatingId === campaign._id}
                        className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                      >
                        {updatingId === campaign._id ? 'Updating…' : 'Pause'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openScheduleModal(campaign)}
                      disabled={updatingId === campaign._id}
                      className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {campaign.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                    </button>
                    {campaign.status === 'scheduled' && (
                      <button
                        type="button"
                        onClick={async () => {
                          setMessage(null)
                          setUpdatingId(campaign._id)
                          try {
                            const res = await apiFetch(`http://localhost:4000/api/campaign/${campaign._id}`, {
                              method: 'PUT',
                              body: JSON.stringify({ status: 'inactive', scheduledAt: null }),
                            })
                            if (!res.ok) throw new Error('Failed to cancel schedule')
                            const updated = await res.json()
                            setLocalCampaigns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
                            setMessage({ type: 'success', text: 'Schedule canceled.' })
                          } catch (err) {
                            setMessage({ type: 'error', text: err.message || 'Unable to cancel schedule.' })
                          } finally {
                            setUpdatingId(null)
                          }
                        }}
                        disabled={updatingId === campaign._id}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openDeleteModal(campaign)}
                      disabled={updatingId === campaign._id}
                      className="inline-flex flex-1 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                  <Link
                    to={`/campaigns/${campaign._id}`}
                    className="btn-ghost flex-1 py-2.5 text-xs justify-center"
                  >
                    View details →
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
      <ScheduleModal
        isOpen={scheduleModalOpen}
        campaign={scheduleCampaignTarget}
        onClose={closeScheduleModal}
        onScheduled={handleScheduled}
      />
      <DeleteCampaignModal
        isOpen={deleteModalOpen}
        campaign={deleteCampaignTarget}
        loading={deleting}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteCampaign}
      />
    </div>
  )
}

export default CampaignManager
