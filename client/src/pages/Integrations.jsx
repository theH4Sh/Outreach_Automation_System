import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Integrations = () => {
  const [loading, setLoading] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [profilesError, setProfilesError] = useState('')
  const [status, setStatus] = useState('')

  const loadProfiles = async () => {
    setProfilesLoading(true)
    setProfilesError('')
    try {
      const res = await fetch('http://localhost:4000/api/getProfiles/')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load profiles')
      setProfiles(data.profiles || [])
    } catch (err) {
      console.error(err)
      const message = err.message || 'Failed to load profiles'
      setProfilesError(message)
      toast.error(message)
    } finally {
      setProfilesLoading(false)
    }
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      await loadProfiles()
    }

    fetchProfiles()
  }, [])

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
      const res = await fetch('http://localhost:4000/api/integrate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileName: profileName.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Integration failed')
      setStatus(`Integration successful for ${profileName.trim()}`)
      toast.success('Integration successful')
      await loadProfiles()
    } catch (err) {
      console.error(err)
      const message = err.message || 'Integration failed'
      setStatus(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProfile = async (profileName) => {
    setStatus('')
    try {
      const res = await fetch(
        `http://localhost:4000/api/deleteProfile/${encodeURIComponent(profileName)}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete profile')
      toast.success(data.message || 'Profile deleted successfully')
      setStatus(`Deleted profile ${profileName}`)
      await loadProfiles()
    } catch (err) {
      console.error(err)
      const message = err.message || 'Failed to delete profile'
      setStatus(message)
      toast.error(message)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Account Integrations</h3>
      <p className="text-sm text-slate-600 mb-4">Connect and manage third-party account integrations.</p>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Profile Name
          </label>
          <input
            type="text"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Enter a unique profile name"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleIntegrate}
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Connecting…' : 'Integrate Instagram Account'}
            </button>
            <button
              onClick={() => { setStatus(''); toast.dismiss() }}
              className="text-sm text-slate-600"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold">Saved Profiles</h4>
              <p className="text-xs text-slate-500">Profiles created by the integration flow.</p>
            </div>
            <button
              onClick={loadProfiles}
              disabled={profilesLoading}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:opacity-60"
            >
              {profilesLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {profilesLoading ? (
            <p className="text-sm text-slate-500">Loading profiles…</p>
          ) : profilesError ? (
            <p className="text-sm text-red-600">{profilesError}</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-slate-500">No connected profiles yet.</p>
          ) : (
            <ul className="space-y-2">
              {profiles.map((profile) => (
                <li
                  key={profile._id || profile.profileName}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{profile.profileName}</p>
                    <p className="text-xs text-slate-500">Saved profile from integration</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProfile(profile.profileName)}
                    className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {status && (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
            <strong>Status:</strong> {status}
          </div>
        )}
      </div>
    </div>
  )
}

export default Integrations
