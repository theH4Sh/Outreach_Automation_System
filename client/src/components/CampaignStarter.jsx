import { useMemo, useRef, useState } from 'react'
import useFetch from '../hooks/useFetch'
import useFileUpload from '../hooks/useFileUpload'
import usePost from '../hooks/usePost'

const CampaignStarter = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: leads, loading: leadsLoading } = useFetch(`http://localhost:4000/api/leads?refresh=${refreshKey}`, 'GET')
  const { post: createCampaign, loading: submitting } = usePost('http://localhost:4000/api/campaign')
  const { upload: uploadLead, loading: uploadingLead } = useFileUpload('http://localhost:4000/api/lead')
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ name: '', description: '', message: '', leads: [] })
  const [message, setMessage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const selectedLeadNames = useMemo(
    () => leads?.filter((lead) => form.leads.includes(lead._id)).map((lead) => lead.name) || [],
    [leads, form.leads],
  )

  const toggleLead = (leadId) => {
    setForm((prev) => {
      const active = prev.leads.includes(leadId)
      return { ...prev, leads: active ? prev.leads.filter((id) => id !== leadId) : [...prev.leads, leadId] }
    })
  }

  const removeLead = (leadId) => {
    setForm((prev) => ({ ...prev, leads: prev.leads.filter((id) => id !== leadId) }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = async () => {
    setMessage(null)

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Pick a CSV file before uploading leads.' })
      return
    }

    try {
      await uploadLead(selectedFile)
      setMessage({ type: 'success', text: 'Lead file uploaded. List refreshed.' })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed. Try again.' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!form.leads.length) {
      setMessage({ type: 'error', text: 'Select at least one lead to launch the campaign.' })
      return
    }

    try {
      await createCampaign(form)
      setMessage({ type: 'success', text: 'Campaign created and ready to launch.' })
      setForm({ name: '', description: '', message: '', leads: [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || err || 'Something went wrong.' })
    }
  }

  return (
    <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-8 rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Campaign flow</p>
            <h1 className="text-4xl font-semibold tracking-tight">Build a powerful campaign fast</h1>
            <p className="max-w-2xl text-sm text-slate-300">Upload leads, pick recipients, and write your message in one beautiful workspace.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Leads</p>
              <p className="mt-2 text-2xl font-semibold">{leads?.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Selected</p>
              <p className="mt-2 text-2xl font-semibold">{form.leads.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
              <p className="mt-2 text-2xl font-semibold">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 rounded-3xl border px-5 py-4 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Campaign details</h2>
            <p className="mt-2 text-sm text-slate-600">Fill the campaign metadata before selecting recipients.</p>

            <div className="mt-6 grid gap-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Campaign title</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Summer Blast 2026"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short summary for internal tracking"
                  rows="3"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Campaign message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="What your audience will receive"
                  rows="5"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Selected leads</h3>
                <p className="mt-1 text-sm text-slate-600">Tap leads to add or remove them.</p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">{form.leads.length} chosen</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {selectedLeadNames.length ? (
                selectedLeadNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const lead = leads.find((item) => item.name === name)
                      if (lead) removeLead(lead._id)
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {name}
                    <span className="text-xs text-slate-300">×</span>
                  </button>
                ))
              ) : (
                <p className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-500">No recipients selected yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Launch campaign</h3>
                <p className="mt-1 text-sm text-slate-600">Review and submit when ready.</p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || leadsLoading}
                className="rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Creating...' : 'Create campaign'}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upload leads</h3>
                <p className="mt-1 text-sm text-slate-600">Drop a CSV to refresh the list instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Choose file
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSelectedFile(file)
                  setMessage(null)
                }
              }}
              className="hidden"
            />

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-600">
              <p>Pick a file to add new leads.</p>
              {selectedFile && <p className="mt-3 text-slate-900">{selectedFile.name}</p>}
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadingLead || !selectedFile}
              className="mt-5 w-full rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {uploadingLead ? 'Uploading...' : 'Upload leads'}
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Available leads</h3>
                <p className="mt-1 text-sm text-slate-600">Tap to add or remove them.</p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">Interactive</span>
            </div>

            <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {leadsLoading ? (
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-500">Loading leads…</div>
              ) : leads?.length ? (
                leads.map((lead) => {
                  const selected = form.leads.includes(lead._id)
                  return (
                    <button
                      key={lead._id}
                      type="button"
                      onClick={() => toggleLead(lead._id)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition ${selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-sm text-slate-500">{lead.email || 'No email available'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                          {selected ? 'Selected' : 'Add'}
                        </span>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-500">No leads found. Upload a CSV to populate the list.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CampaignStarter
