const DeleteCampaignModal = ({ isOpen, campaign, loading, onClose, onConfirm }) => {
  if (!isOpen || !campaign) return null

  const leadCount = campaign.leads?.length ?? 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header accent */}
        <div className="relative h-24 bg-gradient-to-br from-red-500 via-rose-500 to-red-600">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white blur-2xl" />
          </div>
          <div className="relative flex h-full items-end px-6 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Delete campaign?</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            This action is permanent. All campaign data, logs, and progress will be removed and cannot be recovered.
          </p>

          <div className="mt-5 rounded-xl border border-red-100 bg-red-50/60 p-4">
            <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
            {campaign.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{campaign.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-red-100">
                {campaign.status}
              </span>
              {leadCount > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-red-100">
                  {leadCount} lead{leadCount === 1 ? '' : 's'}
                </span>
              )}
              {(campaign.progress ?? 0) > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-red-100">
                  {campaign.progress}% complete
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost flex-1 py-3 disabled:opacity-50"
            >
              Keep campaign
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-500/25"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting…
                </span>
              ) : 'Yes, delete it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteCampaignModal
