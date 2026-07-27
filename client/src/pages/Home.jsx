import { Link } from 'react-router'

const quickActions = [
  {
    to: '/upload',
    label: 'Upload Leads',
    title: 'Batch import leads',
    description: 'Upload CSV files and keep your lead repository current.',
    gradient: 'from-indigo-500 to-violet-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    to: '/templates',
    label: 'Message Templates',
    title: 'Reusable message templates',
    description: 'Save outreach copy with {name} and {username} personalization.',
    gradient: 'from-fuchsia-500 to-pink-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/create-campaign',
    label: 'Create Campaign',
    title: 'Launch a new campaign',
    description: 'Build messages, select leads, and activate your next outreach.',
    gradient: 'from-violet-500 to-purple-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: '/campaigns',
    label: 'Campaign Manager',
    title: 'Monitor all campaigns',
    description: 'View campaign health, status, and control executions.',
    gradient: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/scraper',
    label: 'Lead Scraper',
    title: 'Scrape new leads',
    description: 'Extract leads from any public page and export to CSV.',
    gradient: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
]

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-8 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500 blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-violet-600 blur-[60px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300 font-medium">Welcome back</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to <span className="text-indigo-300">automate</span>?
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
              Centralize lead uploads, campaign creation, and management in one streamlined workspace.
            </p>
          </div>
          <Link
            to="/create-campaign"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </Link>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200"
          >
            <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${action.gradient} p-2.5 text-white shadow-lg`}>
              {action.icon}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">{action.label}</p>
            <h3 className="mt-2 text-base font-bold text-slate-900">{action.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{action.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition group-hover:gap-2">
              Go
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
