import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const LeadScraper = () => {
  const [link, setLink] = useState('')
  const [exportToCSV, setExportToCSV] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const validateUrl = (value) => {
    try {
      const u = new URL(value)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!link) return setError('Please enter a link')
    if (!validateUrl(link)) return setError('Enter a valid http(s) URL')

    setLoading(true)

    try {
      const res = await fetch('http://localhost:4000/api/scrape/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, exportToCSV }),
      })

      if (exportToCSV) {
        if (!res.ok) throw new Error('Failed to export CSV')
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'leads.csv'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success('CSV downloaded')
        setResult(null)
        return
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Scrape failed')
      setResult(data)
      toast.success('Scrape complete')
    } catch (err) {
      toast.error(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const tableHeaders = useMemo(() => {
    if (!result?.leads || result.leads.length === 0) return []
    const allKeys = new Set()
    result.leads.forEach((l) => {
      if (l && typeof l === 'object') Object.keys(l).forEach((k) => allKeys.add(k))
    })
    return Array.from(allKeys)
  }, [result])

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-6 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500 blur-[60px] opacity-40" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300 font-medium">Web scraper</p>
          <p className="mt-1 text-sm text-slate-400">Paste any public page URL to extract lead data automatically.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Page URL</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              className="input-field !pl-10"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/listing"
              aria-invalid={!!error}
            />
          </div>
          {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              id="csv"
              type="checkbox"
              checked={exportToCSV}
              onChange={(e) => setExportToCSV(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-indigo-500" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-slate-700 group-hover:text-slate-900">Export results as CSV</span>
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Working…
              </>
            ) : 'Start Scrape'}
          </button>
          <button type="button" onClick={() => { setLink(''); setError('') }} className="btn-ghost">
            Clear
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Results</h4>
              <p className="text-sm text-slate-500">Found {result.leads?.length ?? 0} leads</p>
            </div>
            <button onClick={() => setResult(null)} className="btn-ghost text-xs py-1.5 px-3">
              Clear
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {result.leads && result.leads.length > 0 ? (
              <div className="max-h-80 overflow-auto">
                <table className="w-full table-auto text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {tableHeaders.map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.leads.map((lead, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-indigo-50/30 transition">
                        {tableHeaders.map((h) => (
                          <td key={h} className="px-4 py-2.5 align-top text-slate-700">
                            {lead && lead[h] != null ? (typeof lead[h] === 'object' ? JSON.stringify(lead[h]) : String(lead[h])) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-sm text-slate-500 text-center">No leads returned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadScraper
