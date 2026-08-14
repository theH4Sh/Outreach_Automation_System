import { Link, useParams } from 'react-router'
import { useCallback, useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { socket } from '../socket'
import { apiFetch } from '../utils/api'

const statusMeta = {
  active: { label: 'Live', className: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20' },
  scheduled: { label: 'Queued', className: 'bg-sky-500/15 text-sky-700 ring-sky-500/20' },
  completed: { label: 'Done', className: 'bg-slate-900 text-white' },
  inactive: { label: 'Idle', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

const CampaignDetailPage = () => {
  const { id } = useParams()
  const { data: campaign, loading, error } = useFetch(`${import.meta.env.VITE_API}campaign/${id}`, 'GET')
  const [currentCampaign, setCurrentCampaign] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [logs, setLogs] = useState([])
  const [liveProgress, setLiveProgress] = useState(null)

  const groupedLogs = logs.reduce((acc, log) => {
    const runId = String(log.runId)
    if (!acc[runId]) acc[runId] = []
    acc[runId].push(log)
    return acc
  }, {})

  const sortedRunIds = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))
  const latestFailedRunId = sortedRunIds.find((runId) => groupedLogs[runId].some((log) => !log.success))
  const failedCount = latestFailedRunId ? groupedLogs[latestFailedRunId].filter((log) => !log.success).length : 0

  const displayedCampaign = currentCampaign ?? (campaign && campaign._id ? campaign : null)
  const progressPercentage = liveProgress ?? (displayedCampaign?.status === 'completed'
    ? 100
    : displayedCampaign?.progress !== undefined && displayedCampaign?.leads?.length
      ? Math.round((displayedCampaign.progress / displayedCampaign.leads.length) * 100)
      : 0)

  const loadLogs = useCallback(async () => {
    if (!id) return
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${id}/logs`)
      if (!res.ok) return
      setLogs(await res.json())
    } catch (err) {
      console.error('Failed to load campaign logs', err)
    }
  }, [id])

  useEffect(() => { loadLogs() }, [loadLogs])

  useEffect(() => {
    if (campaign && campaign._id) setCurrentCampaign(campaign)
  }, [campaign])

  useEffect(() => {
    if (!id) return

    const handleCampaignLog = (data) => {
      if (String(data.campaignId) !== id) return
      setLogs((prev) => [...prev, data])
    }

    const handleCampaignProgress = (data) => {
      if (String(data.campaignId) !== id) return
      setLiveProgress(data.percentage)
      if (data.percentage >= 100) {
        setCurrentCampaign((prev) => (prev ? { ...prev, status: 'completed', progress: 0 } : prev))
      }
    }

    const handleCampaignStatus = (data) => {
      if (String(data.campaignId) !== id) return
      setCurrentCampaign((prev) => (prev ? {
        ...prev,
        status: data.status,
        progress: data.progress ?? prev.progress,
      } : prev))
      if (data.percentage != null) setLiveProgress(data.percentage)
      if (data.status === 'completed') setStatusMessage({ type: 'success', text: 'Finished.' })
    }

    socket.on('campaign-log', handleCampaignLog)
    socket.on('campaign-progress', handleCampaignProgress)
    socket.on('campaign-status', handleCampaignStatus)
    return () => {
      socket.off('campaign-log', handleCampaignLog)
      socket.off('campaign-progress', handleCampaignProgress)
      socket.off('campaign-status', handleCampaignStatus)
    }
  }, [id])

  const handleToggleStatus = async () => {
    if (!displayedCampaign) return
    setStatusMessage(null)
    setUpdating(true)
    const newStatus = displayedCampaign.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setCurrentCampaign(await res.json())
      if (newStatus === 'active') setLiveProgress(0)
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Update failed' })
    } finally {
      setUpdating(false)
    }
  }

  const handleRetryFailed = async () => {
    if (!latestFailedRunId) return
    setRetrying(true)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${id}/retry?runId=${latestFailedRunId}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error((await res.text()) || 'Retry failed')
      await res.text()
      await loadLogs()
      setStatusMessage({ type: 'success', text: `Retrying ${failedCount}` })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Retry failed' })
    } finally {
      setRetrying(false)
    }
  }

  const meta = statusMeta[displayedCampaign?.status] || statusMeta.inactive
  const isActive = displayedCampaign?.status === 'active'

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-12" />
        <div className="skeleton h-40" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  if (error || !displayedCampaign) {
    return (
      <div className="space-y-4">
        <Link to="/campaigns" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Back">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ? 'Couldn’t load campaign.' : 'Campaign not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/campaigns"
            title="Back"
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">{displayedCampaign.name}</h2>
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}>
                {meta.label}
              </span>
            </div>
            {displayedCampaign.description && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{displayedCampaign.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {displayedCampaign.browserProfile && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
              {displayedCampaign.browserProfile.profileName || 'Profile'}
            </span>
          )}

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={updating}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition disabled:opacity-40 ${
              isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {updating ? (
              '…'
            ) : isActive ? (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                {displayedCampaign.status === 'completed' ? 'Rerun' : 'Run'}
              </>
            )}
          </button>

          {latestFailedRunId && (
            <button
              type="button"
              onClick={handleRetryFailed}
              disabled={retrying}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {retrying ? '…' : `Retry ${failedCount}`}
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
          statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Progress strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-bold tabular-nums text-slate-900">{progressPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500' : 'bg-slate-900'}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span><strong className="text-slate-900">{displayedCampaign.leads?.length ?? 0}</strong> leads</span>
          <span>
            Created{' '}
            <strong className="text-slate-900">
              {displayedCampaign.createdAt ? new Date(displayedCampaign.createdAt).toLocaleDateString() : '—'}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Message</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {displayedCampaign.message || '—'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leads</h3>
            <span className="text-[11px] font-medium text-slate-400">{displayedCampaign.leads?.length ?? 0}</span>
          </div>
          {displayedCampaign.leads?.length ? (
            <div className="mt-3 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
              {displayedCampaign.leads.map((lead) => (
                <span
                  key={lead._id || lead.id || lead.name}
                  className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                  {lead.name || lead.email || 'Lead'}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">None selected</p>
          )}
        </section>
      </div>

      {/* Logs */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'}`} />
            <h3 className="text-sm font-semibold text-slate-900">Logs</h3>
          </div>
          <span className="text-[11px] font-medium tabular-nums text-slate-400">{logs.length}</span>
        </div>

        {logs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No activity yet</p>
        ) : (
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {sortedRunIds.map((runId) => (
              <div key={runId} className="px-4 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Run {runId.slice(0, 8)}
                </p>
                <ul className="space-y-1.5">
                  {groupedLogs[runId].map((log, index) => (
                    <li
                      key={`${runId}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900">@{log.username}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{log.message}</p>
                      </div>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.success ? 'ok' : 'fail'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default CampaignDetailPage
