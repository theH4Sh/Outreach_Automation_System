import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiFetch } from '../utils/api'

const formatLocalDateTime = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const tzOffset = date.getTimezoneOffset() * 60000
  const localIso = new Date(date.getTime() - tzOffset).toISOString()
  return localIso.slice(0, 16)
}

const ScheduleModal = ({ isOpen, campaign, onClose, onScheduled }) => {
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setScheduledAt(campaign?.scheduledAt ? formatLocalDateTime(campaign.scheduledAt) : '')
  }, [campaign, isOpen])

  if (!isOpen || !campaign) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduledAt) {
      toast.error('Choose a date and time to schedule the campaign.')
      return
    }

    const scheduledDate = new Date(scheduledAt)
    if (Number.isNaN(scheduledDate.getTime())) {
      toast.error('Invalid date format.')
      return
    }

    if (scheduledDate <= new Date()) {
      toast.error('Please choose a future schedule time.')
      return
    }

    setLoading(true)

    try {
      const res = await apiFetch(`http://localhost:4000/api/campaign/${campaign._id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({ scheduledAt: scheduledDate.toISOString() }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Unable to schedule campaign')
      }

      const updated = await res.json()
      toast.success('Campaign scheduled successfully.')
      onScheduled(updated)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to schedule campaign')
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  const minDate = now.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Schedule campaign</h3>
            <p className="mt-1 text-sm text-slate-500">Pick when this campaign should run automatically.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Run at</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDate}
              className="input-field"
            />
          </div>

          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-slate-700">
            <p>Campaign: <span className="font-semibold text-slate-900">{campaign.name}</span></p>
            {scheduledAt && (
              <p className="mt-2">Scheduled for: <span className="font-semibold text-indigo-700">{new Date(scheduledAt).toLocaleString()}</span></p>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost flex-1 py-3">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? 'Scheduling…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
