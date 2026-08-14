import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import RemoteBrowser from '../components/RemoteBrowser'

const Integrations = () => {
  const [loading, setLoading] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [profilesError, setProfilesError] = useState('')
  const [status, setStatus] = useState('')
  const [showBrowser, setShowBrowser] = useState(false)
  const [activeProfile, setActiveProfile] = useState('')
  const [sessionId, setSessionId] = useState(null)


  const token = useSelector((state) => state?.auth?.token)

  const loadProfiles = async () => {
    setProfilesLoading(true)
    setProfilesError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API}getProfiles/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load profiles')
      setProfiles(data.profiles || [])
    } catch (err) {
      const message = err.message || 'Failed to load profiles'
      setProfilesError(message)
      toast.error(message)
    } finally {
      setProfilesLoading(false)
    }
  }

  useEffect(() => { loadProfiles() }, [])

  const handleIntegrate = async () => {
    if (!profileName.trim()) {
      const message = 'Profile name is required for integration'
      setStatus(message)
      toast.error(message)
      return
    }

    setStatus('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API}integrate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileName: profileName.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Integration failed')
      setStatus(`Integration successful for ${profileName.trim()}`)
      toast.success('Integration successful')
      setShowBrowser(true)
      setSessionId(data.sessionId)
      setActiveProfile(profileName.trim())
      setProfileName('')
      await loadProfiles()
    } catch (err) {
      const message = err.message || 'Integration failed'
      setStatus(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseBrowser = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API}integrate/session`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to close browser')
    }

    toast.success('Browser session closed')

    setShowBrowser(false)
    setRemoteUrl('')
  } catch (err) {
    toast.error(err.message || 'Failed to close browser')
  }
}

  const handleDeleteProfile = async (profileId) => {
    setStatus('')
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API}deleteProfile/${encodeURIComponent(profileId)}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete profile')
      toast.success(data.message || 'Profile deleted successfully')
      await loadProfiles()
    } catch (err) {
      const message = err.message || 'Failed to delete profile'
      setStatus(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connect card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Connect Instagram Account</h3>
            <p className="mt-1 text-sm text-slate-600">Link a browser profile to run automated outreach campaigns.</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter a unique profile name"
                className="input-field flex-1"
              />
              <button onClick={handleIntegrate} disabled={loading} className="btn-primary shrink-0">
                {loading ? 'Connecting…' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remote Browser */}
      {showBrowser && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-black">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <span className="font-semibold text-white">
              Instagram Browser
            </span>

            <button
              onClick={handleCloseBrowser}
              className="text-sm text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <RemoteBrowser
              sessionId={sessionId}
              token={token}
              onClose={() => {
                  setShowBrowser(false)
                  setSessionId(null)
              }}
          />
        </div>
      )}

      {/* Profiles list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Saved Profiles</h3>
            <p className="text-sm text-slate-500">Profiles created by the integration flow</p>
          </div>
          <button onClick={loadProfiles} disabled={profilesLoading} className="btn-ghost text-xs py-1.5 px-3">
            {profilesLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {profilesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : profilesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profilesError}</div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">No connected profiles yet</p>
            <p className="mt-1 text-sm text-slate-500">Connect an account above to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {profiles.map((profile) => (
              <li
                key={profile._id || profile.profileName}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                    {profile.profileName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profile.profileName}</p>
                    <p className="text-xs text-slate-500">Instagram profile</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProfile(profile._id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${status.includes('successful') || status.includes('Deleted') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          {status}
        </div>
      )}
    </div>
  )
}

export default Integrations
