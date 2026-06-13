import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Upload Leads', path: '/upload' },
  { label: 'Scraper', path: '/scraper' },
  { label: 'Integrations', path: '/integrations' },
  { label: 'Create Campaign', path: '/create-campaign' },
  { label: 'Campaign Manager', path: '/campaigns' },
]

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">OAS</p>
                <h1 className="mt-3 text-2xl font-semibold text-slate-900">Operations Automation Suite</h1>
                <p className="mt-2 text-sm text-slate-600">Manage leads, campaigns, and launch flows from one place.</p>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Pro tip</p>
              <p className="mt-2">Keep uploads and campaigns separated for cleaner ops. Use the dashboard for a quick overview before launching.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto flex min-h-full w-full max-w-[1360px] flex-col gap-6">
            <header className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:hidden">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome to OAS</p>
                <h2 className="text-xl font-semibold text-slate-900">Your lead and campaign command center</h2>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {sidebarOpen ? 'Close menu' : 'Open menu'}
              </button>
            </header>

            <div className="hidden md:block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome to OAS</p>
                  <h2 className="text-3xl font-semibold text-slate-900">Your lead and campaign command center</h2>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default RootLayout
