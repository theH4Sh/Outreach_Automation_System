import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { apiFetch } from '../utils/api'

const pad = (n) => String(n).padStart(2, '0')

const toParts = (isoOrLocal) => {
  if (!isoOrLocal) return { date: '', time: '' }
  const d = new Date(isoOrLocal)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

const todayParts = () => toParts(new Date())

const ScheduleModal = ({ isOpen, campaign, onClose, onScheduled }) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (campaign?.scheduledAt) {
      const parts = toParts(campaign.scheduledAt)
      setDate(parts.date)
      setTime(parts.time)
    } else {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 15)
      const parts = toParts(now)
      setDate(parts.date)
      setTime(parts.time)
    }
  }, [campaign, isOpen])

  const scheduledDate = useMemo(() => {
    if (!date || !time) return null
    const d = new Date(`${date}T${time}`)
    return Number.isNaN(d.getTime()) ? null : d
  }, [date, time])

  const preview = useMemo(() => {
    if (!scheduledDate) return ''
    return scheduledDate.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [scheduledDate])

  if (!isOpen || !campaign) return null

  const minDate = todayParts().date

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduledDate) {
      toast.error('Pick date & time')
      return
    }
    if (scheduledDate <= new Date()) {
      toast.error('Must be in the future')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}campaign/${campaign._id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({ scheduledAt: scheduledDate.toISOString() }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Schedule failed')
      }

      const updated = await res.json()
      toast.success('Queued')
      onScheduled(updated)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Schedule failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Schedule</h3>
            <p className="truncate text-xs text-slate-500">{campaign.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">Date</span>
              <input
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">Time</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>
          </div>

          {preview && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Runs <span className="font-semibold text-slate-900">{preview}</span>
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading ? '…' : 'Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
