import { Link } from 'react-router'

const Home = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard overview</h2>
        <p className="mt-2 text-slate-600">Centralize lead uploads, campaign creation, and management in one streamlined workspace.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link to="/upload" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Upload Leads</p>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Batch import leads</h3>
          <p className="mt-2 text-slate-600">Upload CSV files and keep your lead repository current.</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-slate-700 transition group-hover:text-slate-900">Go to upload →</span>
        </Link>

        <Link to="/create-campaign" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Create Campaign</p>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Launch a new campaign</h3>
          <p className="mt-2 text-slate-600">Build campaign messages, select leads, and activate your next outreach.</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-slate-700 transition group-hover:text-slate-900">Start campaign →</span>
        </Link>

        <Link to="/campaigns" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Campaign Manager</p>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Monitor all campaigns</h3>
          <p className="mt-2 text-slate-600">View campaign health, status, and control executions from one place.</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-slate-700 transition group-hover:text-slate-900">Manage campaigns →</span>
        </Link>
      </section>
    </div>
  )
}

export default Home
