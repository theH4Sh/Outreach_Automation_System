const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-dark p-12 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 blur-[80px] opacity-40" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">OAS</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Automate your<br />
            <span className="text-indigo-300">outreach at scale</span>
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            Upload leads, launch campaigns, and track every message — all from one powerful command center.
          </p>
          <div className="flex gap-6 pt-2">
            {[
              { label: 'Campaigns', value: '∞' },
              { label: 'Leads', value: '10k+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} Operations Automation Suite
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-mesh px-6 py-12">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold">OAS</span>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
