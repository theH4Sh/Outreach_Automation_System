import { Link, useParams } from 'react-router'
import { useCallback, useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { socket } from '../socket'

const CampaignDetailPage = () => {
  const { id } = useParams()
  const { data: campaign, loading, error } = useFetch(`http://localhost:4000/api/campaign/${id}`, 'GET')
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
  const progressPercentage = liveProgress ?? (displayedCampaign?.progress !== undefined && displayedCampaign?.leads?.length
    ? Math.round((displayedCampaign.progress / displayedCampaign.leads.length) * 100)
    : 0)

  const loadLogs = useCallback(async () => {
    if (!id) return

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${id}/logs`)
      if (!res.ok) return
      const data = await res.json()
      setLogs(data)
    } catch (err) {
      console.error('Failed to load campaign logs', err)
    }
  }, [id])

  useEffect(() => {
    const fetchLogs = async () => {
      await loadLogs()
    }

    fetchLogs()
  }, [loadLogs])

  useEffect(() => {
    if (!id) return

    const handleCampaignLog = (data) => {
      if (String(data.campaignId) !== id) return
      setLogs((prevLogs) => [...prevLogs, data])
    }

    const handleCampaignProgress = (data) => {
      if (String(data.campaignId) !== id) return
      setLiveProgress(data.percentage)
    }

    socket.on('campaign-log', handleCampaignLog)
    socket.on('campaign-progress', handleCampaignProgress)

    return () => {
      socket.off('campaign-log', handleCampaignLog)
      socket.off('campaign-progress', handleCampaignProgress)
    }
  }, [id])

  const handleToggleStatus = async () => {
    const campaignToUpdate = displayedCampaign
    if (!campaignToUpdate) return
    setStatusMessage(null)
    setUpdating(true)

    const newStatus = campaignToUpdate.status === 'active' ? 'inactive' : 'active'

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

  const handleRetryFailed = async () => {
    if (!latestFailedRunId) return
    setStatusMessage(null)
    setRetrying(true)

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${id}/retry?runId=${latestFailedRunId}`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Unable to retry failed leads')
      }

      const text = await res.text()
      if (text) {
        try {
          JSON.parse(text)
        } catch {
          console.warn('Retry response not JSON:', text)
        }
      }

      await loadLogs()
      setStatusMessage({ type: 'success', text: `Retry started for ${failedCount} failed lead${failedCount === 1 ? '' : 's'}.` })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Retry failed.' })
    } finally {
      setRetrying(false)
    }
  }

  const actionLabel = displayedCampaign?.status === 'active' ? 'Pause campaign' : 'Start campaign'
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
      ) : !displayedCampaign ? (
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
                <h3 className="text-3xl font-semibold text-slate-900">{displayedCampaign.name}</h3>
                <p className="mt-3 text-slate-600">{displayedCampaign.description || 'No campaign description available.'}</p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <span className={`inline-flex items-center rounded-3xl px-4 py-2 text-sm font-semibold ${statusBadge(displayedCampaign.status)}`}>
                  Status: <span className="ml-2 text-slate-900">{displayedCampaign.status}</span>
                </span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={updating}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {updating ? 'Saving…' : actionLabel}
                  </button>
                  {latestFailedRunId && (
                    <button
                      type="button"
                      onClick={handleRetryFailed}
                      disabled={retrying}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {retrying ? 'Retrying…' : `Retry ${failedCount} failed`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{progressPercentage}%</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Lead count</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{displayedCampaign.leads?.length ?? 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Created</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{displayedCampaign.createdAt ? new Date(displayedCampaign.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Campaign message</h4>
              <p className="mt-3 whitespace-pre-line text-slate-700">{displayedCampaign.message || 'No message provided.'}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Selected leads</h4>
              {displayedCampaign.leads && displayedCampaign.leads.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {displayedCampaign.leads.map((lead) => (
                    <span key={lead._id || lead.id || lead.name} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{lead.name || lead.email || 'Lead'}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">No leads selected for this campaign.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Live campaign logs</h4>
              <span className="text-sm text-slate-500">{logs.length} events</span>
            </div>
            {logs.length === 0 ? (
              <p className="mt-4 text-slate-600">Waiting for campaign activity...</p>
            ) : (
              <div className="mt-4 space-y-6 max-h-96 overflow-y-auto">
                {sortedRunIds.map((runId) => (
                  <div key={runId} className="border-l-4 border-slate-300 pl-4">
                    <p className="text-xs font-medium text-slate-500 mb-3">Run {runId.slice(0, 8)}... ({groupedLogs[runId].length} logs)</p>
                    <div className="space-y-2">
                      {groupedLogs[runId].map((log, index) => (
                        <div key={`${runId}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-slate-900">{log.username}</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDetailPage
