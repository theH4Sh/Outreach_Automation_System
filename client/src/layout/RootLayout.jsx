import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'

const IconHome = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconUpload = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)
const IconSearch = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const IconLink = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)
const IconDoc = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const IconPlus = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)
const IconBars = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const IconUser = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconShield = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Home', path: '/', icon: <IconHome /> },
      { label: 'Upload', path: '/upload', icon: <IconUpload /> },
      { label: 'Scraper', path: '/scraper', icon: <IconSearch /> },
      { label: 'Integrations', path: '/integrations', icon: <IconLink /> },
      { label: 'Templates', path: '/templates', icon: <IconDoc /> },
    ],
  },
  {
    label: 'Campaigns',
    items: [
      { label: 'New', path: '/create-campaign', icon: <IconPlus /> },
      { label: 'Manage', path: '/campaigns', icon: <IconBars /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', path: '/settings', icon: <IconUser /> },
    ],
  },
]

const adminItem = { label: 'Admin', path: '/admin', icon: <IconShield />, admin: true }

const pageTitles = {
  '/': { title: 'Home' },
  '/upload': { title: 'Upload' },
  '/scraper': { title: 'Scraper' },
  '/integrations': { title: 'Integrations' },
  '/templates': { title: 'Templates' },
  '/create-campaign': { title: 'New Campaign' },
  '/campaigns': { title: 'Campaigns' },
  '/settings': { title: 'Settings' },
  '/admin': { title: 'Admin' },
}

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { role } = useSelector((state) => state.auth)

  const groups = navGroups.map((group) =>
    group.label === 'Account' && role === 'admin'
      ? { ...group, items: [...group.items, adminItem] }
      : group
  )

  const pageInfo = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/campaigns/') ? { title: 'Campaign' } : null)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar
        onMenuToggle={() => setSidebarOpen((open) => !open)}
        sidebarOpen={sidebarOpen}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-100 px-4 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
              O
            </span>
            <span className="text-sm font-semibold text-slate-900">OAS</span>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                          isActive
                            ? item.admin
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-900 text-white'
                            : item.admin
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-[1360px] space-y-4">
            {pageInfo && (
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {pageInfo.title}
              </h1>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default RootLayout
