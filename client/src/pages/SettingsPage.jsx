import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { updateUser } from '../slice/authSlice'

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

const syncAuthStorage = (auth) => {
  localStorage.setItem('auth', JSON.stringify(auth))
}

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { token, username, role } = useSelector((state) => state.auth)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API}auth/me`, {
          headers: getAuthHeaders(token),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load profile')

        setProfile(data)
        setProfileForm({ username: data.username, email: data.email })
      } catch (err) {
        toast.error(err.message || 'Unable to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (token) loadProfile()
  }, [token])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API}auth/profile`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      setProfile((prev) => ({ ...prev, ...data }))
      dispatch(updateUser({ username: data.username, token: data.token, role: data.role }))

      const stored = JSON.parse(localStorage.getItem('auth') || '{}')
      syncAuthStorage({
        ...stored,
        username: data.username,
        token: data.token,
        role: data.role,
        isAuthenticated: true,
      })

      toast.success(data.message || 'Profile updated')
      if (data.email !== profile?.email && !data.isVerified) {
        toast('Email changed — please verify your new address', { icon: '📧' })
      }
    } catch (err) {
      toast.error(err.message || 'Profile update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API}auth/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success(data.message || 'Password updated')
    } catch (err) {
      toast.error(err.message || 'Password update failed')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="skeleton h-28" />
        <div className="skeleton h-64" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  const initials = (profile?.username || username || 'U').charAt(0).toUpperCase()

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-6 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-indigo-500 blur-[60px] opacity-40" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.username || username}</h2>
            <p className="text-sm text-slate-400">{profile?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium uppercase tracking-wider">
                {profile?.role || role}
              </span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${profile?.isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {profile?.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          {/* Profile form */}
          <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Profile information</h3>
              <p className="mt-1 text-sm text-slate-500">Update your username and email address.</p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                className="input-field"
                value={profileForm.username}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <p className="mt-1.5 text-xs text-slate-400">Changing your email will require re-verification.</p>
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-50">
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>

          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Change password</h3>
              <p className="mt-1 text-sm text-slate-500">Use a strong password with mixed characters.</p>
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
              <input
                id="currentPassword"
                type="password"
                required
                className="input-field"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                className="input-field"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={savingPassword} className="btn-primary disabled:opacity-50">
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Account info sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account</h4>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Member since</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Role</p>
              <p className="mt-1 text-sm font-medium text-slate-700 capitalize">{profile?.role || role}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Email status</p>
              <p className={`mt-1 text-sm font-medium ${profile?.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {profile?.isVerified ? 'Verified' : 'Pending verification'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-700 leading-relaxed">
            Password must include uppercase, lowercase, numbers, and symbols to meet security requirements.
          </div>
        </aside>
      </div>
    </div>
  )
}

export default SettingsPage
