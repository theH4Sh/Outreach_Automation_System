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
    } catch (e) {
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
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Scrape failed')
      setResult(data)
      toast.success('Scrape complete')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => setResult(null)

  const tableHeaders = useMemo(() => {
    if (!result?.leads || result.leads.length === 0) return []
    const allKeys = new Set()
    result.leads.forEach((l) => {
      if (l && typeof l === 'object') Object.keys(l).forEach((k) => allKeys.add(k))
    })
    return Array.from(allKeys)
  }, [result])

  return (
    <div>
      <h3 className="text-lg font-semibold">Lead Scraper</h3>
      <p className="text-sm text-slate-600 mb-4">Enter a page link to scrape leads from.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Link</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/listing"
            aria-invalid={!!error}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input id="csv" type="checkbox" checked={exportToCSV} onChange={(e) => setExportToCSV(e.target.checked)} />
          <label htmlFor="csv" className="text-sm text-slate-700">Export as CSV</label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Working…' : 'Start Scrape'}
          </button>
          <button type="button" onClick={() => { setLink(''); setError('') }} className="text-sm text-slate-600">Clear</button>
        </div>
      </form>

      {result && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Results</h4>
              <p className="text-sm text-slate-600">Found {result.leads?.length ?? 0} leads</p>
            </div>
            <div className="flex gap-2">
              <button onClick={clearResults} className="text-sm text-slate-600">Clear results</button>
            </div>
          </div>

          <div className="mt-3 max-h-80 overflow-auto border border-slate-100 p-3">
            {result.leads && result.leads.length > 0 ? (
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {tableHeaders.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.leads.map((lead, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {tableHeaders.map((h) => (
                        <td key={h} className="px-3 py-2 align-top">
                          {lead && lead[h] != null ? (typeof lead[h] === 'object' ? JSON.stringify(lead[h]) : String(lead[h])) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500">No leads returned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadScraper
