import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import useFetch from '../hooks/useFetch'
import ScheduleModal from './ScheduleModal'
import DeleteCampaignModal from './DeleteCampaignModal'
import { apiFetch } from '../utils/api'
import { socket } from '../socket'

const statusMeta = {
  active: { label: 'Live', className: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20' },
  scheduled: { label: 'Queued', className: 'bg-sky-500/15 text-sky-700 ring-sky-500/20' },
  completed: { label: 'Done', className: 'bg-slate-900/90 text-white ring-slate-900/10' },
  inactive: { label: 'Idle', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

const IconPlay = () => (
  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
)
const IconPause = () => (
  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
)
const IconClock = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
const IconTrash = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
)
const IconChevron = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
)
const IconX = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
)

const progressPct = (campaign) => {
  const leads = campaign.leads?.length || 0
  if (!leads) return 0
  if (campaign.status === 'completed') return 100
  const raw = Number(campaign.progress) || 0
  // progress is stored as completed count
  if (raw <= leads) return Math.round((raw / leads) * 100)
  return Math.min(100, Math.round(raw))
}

const CampaignManager = () => {
  const { data: campaigns, loading: campaignsLoading, error: campaignsError } = useFetch(`${import.meta.env.VITE_API}campaigns`, 'GET')
  const [message, setMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [localCampaigns, setLocalCampaigns] = useState([])
  const [filter, setFilter] = useState('all')
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleCampaignTarget, setScheduleCampaignTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLocalCampaigns(Array.isArray(campaigns) ? campaigns : [])
  }, [campaigns])

  useEffect(() => {
    const handleCampaignStatus = (data) => {
      setLocalCampaigns((prev) =>
        prev.map((c) =>
          String(c._id) === String(data.campaignId)
            ? { ...c, status: data.status, progress: data.progress ?? c.progress }
            : c
        )
      )
    }
    socket.on('campaign-status', handleCampaignStatus)
    return () => socket.off('campaign-status', handleCampaignStatus)
  }, [])

  const summary = useMemo(() => {
    const items = Array.isArray(localCampaigns) ? localCampaigns : []
    return {
      total: items.length,
      active: items.filter((item) => item.status === 'active').length,
      scheduled: items.filter((item) => item.status === 'scheduled').length,
      completed: items.filter((item) => item.status === 'completed').length,
    }
  }, [localCampaigns])

  const filtered = useMemo(() => {
    const items = Array.isArray(localCampaigns) ? localCampaigns : []
    if (filter === 'all') return items
    return items.filter((c) => c.status === filter)
  }, [localCampaigns, filter])

  const handleStatusChange = async (campaignId, newStatus) => {
    setMessage(null)
    setUpdatingId(campaignId)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${campaignId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setLocalCampaigns((prev) => prev.map((c) => (c._id === campaignId ? updated : c)))
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' })
    } finally {
      setUpdatingId(null)
    }
  }

  const cancelSchedule = async (campaign) => {
    setUpdatingId(campaign._id)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${campaign._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'inactive', scheduledAt: null }),
      })
      if (!res.ok) throw new Error('Failed to cancel')
      const updated = await res.json()
      setLocalCampaigns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cancel failed' })
    } finally {
      setUpdatingId(null)
    }
  }

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignTarget) return
    const campaignId = deleteCampaignTarget._id
    setDeleting(true)
    setUpdatingId(campaignId)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${campaignId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setLocalCampaigns((prev) => prev.filter((c) => c._id !== campaignId))
      setDeleteModalOpen(false)
      setDeleteCampaignTarget(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' })
    } finally {
      setDeleting(false)
      setUpdatingId(null)
    }
  }

  const filters = [
    { id: 'all', label: 'All', count: summary.total },
    { id: 'active', label: 'Live', count: summary.active },
    { id: 'scheduled', label: 'Queued', count: summary.scheduled },
    { id: 'completed', label: 'Done', count: summary.completed },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filter === f.id ? 'bg-white/20' : 'bg-white text-slate-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <Link to="/create-campaign" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New
        </Link>
      </div>

      {(message || campaignsError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {message?.text || campaignsError?.error || campaignsError?.message || 'Something went wrong'}
        </div>
      )}

      {campaignsLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm font-semibold text-slate-800">No campaigns</p>
          <Link to="/create-campaign" className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            Create one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1fr_90px_100px_140px_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Campaign</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Leads</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((campaign) => {
              const pct = progressPct(campaign)
              const meta = statusMeta[campaign.status] || statusMeta.inactive
              const busy = updatingId === campaign._id

              return (
                <li key={campaign._id} className="group px-4 py-3.5 transition hover:bg-slate-50/70">
                  <div className="grid gap-3 sm:grid-cols-[1fr_90px_100px_140px_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/campaigns/${campaign._id}`}
                          className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {campaign.name}
                        </Link>
                      </div>
                      {campaign.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">{campaign.description}</p>
                      )}
                      {campaign.status === 'scheduled' && campaign.scheduledAt && (
                        <p className="mt-1 text-[11px] text-sky-600">
                          {new Date(campaign.scheduledAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${campaign.status === 'active' ? 'bg-emerald-500' : 'bg-slate-900'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] font-medium tabular-nums text-slate-500">{pct}%</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{campaign.leads?.length ?? 0}</span> leads
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {campaign.status === 'active' ? (
                        <button
                          type="button"
                          title="Pause"
                          disabled={busy}
                          onClick={() => handleStatusChange(campaign._id, 'inactive')}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-amber-500 px-2.5 text-[11px] font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
                        >
                          <IconPause /> Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Run"
                          disabled={busy}
                          onClick={() => handleStatusChange(campaign._id, 'active')}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                        >
                          <IconPlay /> Run
                        </button>
                      )}

                      <button
                        type="button"
                        title="Schedule"
                        disabled={busy}
                        onClick={() => { setScheduleCampaignTarget(campaign); setScheduleModalOpen(true) }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40"
                      >
                        <IconClock />
                      </button>

                      {campaign.status === 'scheduled' && (
                        <button
                          type="button"
                          title="Cancel schedule"
                          disabled={busy}
                          onClick={() => cancelSchedule(campaign)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40"
                        >
                          <IconX />
                        </button>
                      )}

                      <button
                        type="button"
                        title="Delete"
                        disabled={busy}
                        onClick={() => { setDeleteCampaignTarget(campaign); setDeleteModalOpen(true) }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <IconTrash />
                      </button>

                      <Link
                        to={`/campaigns/${campaign._id}`}
                        title="Open"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                      >
                        <IconChevron />
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <ScheduleModal
        isOpen={scheduleModalOpen}
        campaign={scheduleCampaignTarget}
        onClose={() => { setScheduleCampaignTarget(null); setScheduleModalOpen(false) }}
        onScheduled={(updated) => {
          setLocalCampaigns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
        }}
      />
      <DeleteCampaignModal
        isOpen={deleteModalOpen}
        campaign={deleteCampaignTarget}
        loading={deleting}
        onClose={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteCampaignTarget(null) } }}
        onConfirm={confirmDeleteCampaign}
      />
    </div>
  )
}

export default CampaignManager
