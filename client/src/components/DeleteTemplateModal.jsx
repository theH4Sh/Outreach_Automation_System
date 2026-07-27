const DeleteTemplateModal = ({ isOpen, template, loading, onClose, onConfirm }) => {
  if (!isOpen || !template) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-20 bg-gradient-to-br from-slate-700 to-slate-900">
          <div className="absolute inset-0 flex items-end px-6 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Delete template?</h3>
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{template.name}</span> will be permanently removed.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost flex-1 py-3">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting…' : 'Delete template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteTemplateModal
