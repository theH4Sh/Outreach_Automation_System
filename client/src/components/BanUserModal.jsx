import { useEffect, useState } from 'react'

const BanUserModal = ({ isOpen, user, loading, onClose, onConfirm }) => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) setReason('')
  }, [isOpen, user])

  if (!isOpen || !user) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-20 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500">
          <div className="absolute inset-0 flex items-end px-6 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Ban user?</h3>
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{user.username}</span> will lose access immediately.
            </p>
          </div>

          <div>
            <label htmlFor="banReason" className="block text-sm font-medium text-slate-700 mb-1.5">Reason (optional)</label>
            <textarea
              id="banReason"
              rows={3}
              className="input-field resize-none"
              placeholder="Violation of terms, spam, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost flex-1 py-3">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(reason)}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Banning…' : 'Ban user'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BanUserModal
