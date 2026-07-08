import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Upload Leads',
    path: '/upload',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: 'Scraper',
    path: '/scraper',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: 'Integrations',
    path: '/integrations',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    label: 'Message Templates',
    path: '/templates',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Create Campaign',
    path: '/create-campaign',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: 'Campaign Manager',
    path: '/campaigns',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Account Settings',
    path: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

const adminNavItem = {
  label: 'Admin Panel',
  path: '/admin',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
}

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Your lead and campaign command center' },
  '/upload': { title: 'Upload Leads', subtitle: 'Import and manage your lead database' },
  '/scraper': { title: 'Lead Scraper', subtitle: 'Extract leads from any public page' },
  '/integrations': { title: 'Integrations', subtitle: 'Connect your social accounts' },
  '/templates': { title: 'Message Templates', subtitle: 'Create and manage reusable outreach messages' },
  '/create-campaign': { title: 'Create Campaign', subtitle: 'Build and launch your next outreach' },
  '/campaigns': { title: 'Campaign Manager', subtitle: 'Monitor and control all campaigns' },
  '/settings': { title: 'Account Settings', subtitle: 'Manage your profile and security' },
  '/admin': { title: 'Admin Panel', subtitle: 'Manage users, logs, and system oversight' },
}

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { role } = useSelector((state) => state.auth)
  const sidebarItems = role === 'admin' ? [...navItems, adminNavItem] : navItems
  const pageInfo = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/campaigns/') ? { title: 'Campaign Detail', subtitle: 'Live progress and activity logs' } : null)

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar
        onMenuToggle={() => setSidebarOpen((open) => !open)}
        sidebarOpen={sidebarOpen}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto bg-gradient-dark transition-transform duration-300 ease-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col justify-between p-5 pt-20 md:pt-6">
            <div>
              <div className="mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">OAS</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Automation Suite</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? item.path === '/admin'
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25'
                            : 'bg-gradient-brand text-white shadow-lg shadow-indigo-500/25'
                          : item.path === '/admin'
                          ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mx-2 rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300">System online</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Upload leads separately from campaigns for cleaner ops workflow.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1360px] space-y-6">
            {pageInfo && (
              <div className="animate-fade-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {pageInfo.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{pageInfo.subtitle}</p>
              </div>
            )}

            <div className="card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default RootLayout
