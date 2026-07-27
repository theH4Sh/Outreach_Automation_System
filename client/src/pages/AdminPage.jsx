import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import toast from 'react-hot-toast'
import { adminFetch } from '../utils/api'
import BanUserModal from '../components/BanUserModal'
import DeleteUserModal from '../components/DeleteUserModal'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'logs', label: 'Logs' },
  { id: 'campaigns', label: 'Campaigns' },
]

const statusBadge = (user) => {
  if (user.isBanned) return 'bg-red-100 text-red-700'
  if (user.role === 'admin') return 'bg-violet-100 text-violet-700'
  if (!user.isVerified) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

const statusLabel = (user) => {
  if (user.isBanned) return 'Banned'
  if (user.role === 'admin') return 'Admin'
  if (!user.isVerified) return 'Unverified'
  return 'Active'
}

const AdminPage = () => {
  const { token, role, username: currentUsername } = useSelector((state) => state.auth)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [logPagination, setLogPagination] = useState(null)
  const [campaigns, setCampaigns] = useState([])

  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [logFilter, setLogFilter] = useState('all')
  const [logPage, setLogPage] = useState(1)

  const [banTarget, setBanTarget] = useState(null)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const loadOverview = useCallback(async () => {
    const data = await adminFetch(token, '/stats')
    setStats(data)
  }, [token])

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams()
    if (userSearch) params.set('search', userSearch)
    if (userFilter !== 'all') params.set('status', userFilter)
    const query = params.toString() ? `?${params}` : ''
    const data = await adminFetch(token, `/users${query}`)
    setUsers(data)
  }, [token, userSearch, userFilter])

  const loadLogs = useCallback(async () => {
    const params = new URLSearchParams({ page: logPage, limit: 30 })
    if (logFilter !== 'all') params.set('status', logFilter)
    const data = await adminFetch(token, `/logs?${params}`)
    setLogs(data.logs)
    setLogPagination(data.pagination)
  }, [token, logFilter, logPage])

  const loadCampaigns = useCallback(async () => {
    const data = await adminFetch(token, '/campaigns')
    setCampaigns(data)
  }, [token])

  useEffect(() => {
    if (role !== 'admin') return

    const load = async () => {
      setLoading(true)
      try {
        if (tab === 'overview') await loadOverview()
        if (tab === 'users') await loadUsers()
        if (tab === 'logs') await loadLogs()
        if (tab === 'campaigns') await loadCampaigns()
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [tab, role, loadOverview, loadUsers, loadLogs, loadCampaigns])

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleBan = async (reason) => {
    if (!banTarget) return
    setActionLoading(banTarget._id)
    try {
      await adminFetch(token, `/users/${banTarget._id}/ban`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      })
      toast.success(`${banTarget.username} banned`)
      setBanModalOpen(false)
      setBanTarget(null)
      await loadUsers()
      if (tab === 'overview') await loadOverview()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnban = async (user) => {
    setActionLoading(user._id)
    try {
      await adminFetch(token, `/users/${user._id}/unban`, { method: 'PATCH' })
      toast.success(`${user.username} unbanned`)
      await loadUsers()
      if (tab === 'overview') await loadOverview()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (user, newRole) => {
    setActionLoading(user._id)
    try {
      await adminFetch(token, `/users/${user._id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })
      toast.success(`${user.username} is now ${newRole}`)
      await loadUsers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget._id)
    try {
      await adminFetch(token, `/users/${deleteTarget._id}`, { method: 'DELETE' })
      toast.success(`${deleteTarget.username} deleted`)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      await loadUsers()
      if (tab === 'overview') await loadOverview()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const campaignStatusColor = (status) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700'
    if (status === 'scheduled') return 'bg-indigo-100 text-indigo-700'
    if (status === 'completed') return 'bg-sky-100 text-sky-700'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-6 text-white">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-violet-600 blur-[80px] opacity-40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300 font-medium">Administration</p>
            <h2 className="mt-1 text-xl font-bold">System control panel</h2>
            <p className="mt-1 text-sm text-slate-400">Manage users, monitor logs, and oversee campaigns.</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
            Signed in as <span className="font-semibold text-white">{currentUsername}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 -mb-[2px]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-24" />
          <div className="skeleton h-64" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Total Users', value: stats.users.total, sub: `${stats.users.banned} banned`, color: 'from-indigo-500 to-violet-600' },
                  { label: 'Campaigns', value: stats.campaigns.total, sub: `${stats.campaigns.active} active`, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Leads', value: stats.leads.total, sub: 'uploaded files', color: 'from-amber-500 to-orange-600' },
                  { label: 'Log Events', value: stats.logs.total, sub: `${stats.logs.failed} failed`, color: 'from-rose-500 to-red-600' },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${card.color} p-2`}>
                      <div className="h-2 w-2 rounded-full bg-white/80" />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">{card.label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-900">Recent signups</h3>
                <div className="mt-4 space-y-2">
                  {stats.recentUsers?.length ? stats.recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{u.username}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(u)}`}>
                        {statusLabel(u)}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500">No users yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  placeholder="Search by username or email…"
                  className="input-field flex-1"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                />
                <select
                  className="input-field sm:w-40"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">All users</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                  <option value="admin">Admins</option>
                </select>
                <button type="button" onClick={loadUsers} className="btn-primary shrink-0">Search</button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left">
                        <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Joined</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{user.username}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                            {user.isBanned && user.banReason && (
                              <p className="mt-1 text-xs text-red-600">Reason: {user.banReason}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(user)}`}>
                              {statusLabel(user)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-end gap-2">
                              {user.role !== 'admin' && !user.isBanned && (
                                <button
                                  type="button"
                                  disabled={actionLoading === user._id}
                                  onClick={() => { setBanTarget(user); setBanModalOpen(true) }}
                                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                >
                                  Ban
                                </button>
                              )}
                              {user.isBanned && (
                                <button
                                  type="button"
                                  disabled={actionLoading === user._id}
                                  onClick={() => handleUnban(user)}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                >
                                  Unban
                                </button>
                              )}
                              {user.role === 'user' && !user.isBanned && (
                                <button
                                  type="button"
                                  disabled={actionLoading === user._id}
                                  onClick={() => handleRoleChange(user, 'admin')}
                                  className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                                >
                                  Make admin
                                </button>
                              )}
                              {user.role === 'admin' && user.username !== currentUsername && (
                                <button
                                  type="button"
                                  disabled={actionLoading === user._id}
                                  onClick={() => handleRoleChange(user, 'user')}
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                >
                                  Demote
                                </button>
                              )}
                              {user.role !== 'admin' && (
                                <button
                                  type="button"
                                  disabled={actionLoading === user._id}
                                  onClick={() => { setDeleteTarget(user); setDeleteModalOpen(true) }}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && (
                  <p className="p-8 text-center text-sm text-slate-500">No users match your search.</p>
                )}
              </div>
            </div>
          )}

          {/* Logs */}
          {tab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="input-field w-40"
                  value={logFilter}
                  onChange={(e) => { setLogFilter(e.target.value); setLogPage(1) }}
                >
                  <option value="all">All logs</option>
                  <option value="success">Success only</option>
                  <option value="failed">Failed only</option>
                </select>
                {logPagination && (
                  <p className="text-sm text-slate-500">
                    {logPagination.total} total events
                  </p>
                )}
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto">
                {logs.map((log) => {
                  const sender =
                    log.sentBy ||
                    log.sentById?.username ||
                    log.campaignId?.lastActivatedBy?.username ||
                    log.campaignId?.createdBy?.username ||
                    'Unknown'
                  const recipient = log.username

                  return (
                  <div
                    key={log._id}
                    className={`rounded-xl border p-4 ${log.success ? 'border-emerald-100 bg-emerald-50/40' : 'border-red-100 bg-red-50/40'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Sent by {sender}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            → @{recipient}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{log.message}</p>
                        {log.campaignId?.name && (
                          <p className="text-xs text-indigo-600">Campaign: {log.campaignId.name}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  )
                })}
                {logs.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-8">No logs found.</p>
                )}
              </div>

              {logPagination && logPagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((p) => p - 1)}
                    className="btn-ghost text-xs disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-500">Page {logPage} of {logPagination.pages}</span>
                  <button
                    type="button"
                    disabled={logPage >= logPagination.pages}
                    onClick={() => setLogPage((p) => p + 1)}
                    className="btn-ghost text-xs disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Campaigns */}
          {tab === 'campaigns' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {campaigns.map((c) => (
                <div key={c._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                      {c.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${campaignStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-xs text-slate-400">Progress</p>
                      <p className="font-bold text-slate-800">{c.progress ?? 0}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-xs text-slate-400">Leads</p>
                      <p className="font-bold text-slate-800">{c.leads?.length ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <p className="text-xs text-slate-400">Profile</p>
                      <p className="font-bold text-slate-800 truncate text-xs">{c.browserProfile?.profileName || '—'}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400">
                    Created {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {campaigns.length === 0 && (
                <p className="col-span-2 text-center text-sm text-slate-500 py-8">No campaigns in the system.</p>
              )}
            </div>
          )}
        </>
      )}

      <BanUserModal
        isOpen={banModalOpen}
        user={banTarget}
        loading={actionLoading === banTarget?._id}
        onClose={() => { if (!actionLoading) { setBanModalOpen(false); setBanTarget(null) } }}
        onConfirm={handleBan}
      />
      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={deleteTarget}
        loading={actionLoading === deleteTarget?._id}
        onClose={() => { if (!actionLoading) { setDeleteModalOpen(false); setDeleteTarget(null) } }}
        onConfirm={handleDeleteUser}
      />
    </div>
  )
}

export default AdminPage
