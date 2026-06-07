import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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

    const now = new Date()
    if (scheduledDate <= now) {
      toast.error('Please choose a future schedule time.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`http://localhost:4000/api/campaign/${campaign._id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Schedule campaign</h3>
            <p className="mt-2 text-sm text-slate-600">Pick when this campaign should run automatically.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Run at</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDate}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              Campaign: <span className="font-semibold text-slate-900">{campaign.name}</span>
            </p>
            {scheduledAt && (
              <p className="mt-2">
                Scheduled for: <span className="font-semibold text-slate-900">{new Date(scheduledAt).toLocaleString()}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Scheduling…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
