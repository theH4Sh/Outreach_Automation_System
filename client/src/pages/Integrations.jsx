import { useState } from 'react'
import toast from 'react-hot-toast'

const Integrations = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleIntegrate = async () => {
    setStatus('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/integrate/', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Integration failed')
      setStatus('Integration successful')
      toast.success('Integration successful')
    } catch (err) {
      console.error(err)
      setStatus(err.message || 'Integration failed')
      toast.error(err.message || 'Integration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Account Integrations</h3>
      <p className="text-sm text-slate-600 mb-4">Connect and manage third-party account integrations.</p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
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
