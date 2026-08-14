import { useMemo, useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import useFetch from '../hooks/useFetch'
import useFileUpload from '../hooks/useFileUpload'
import usePost from '../hooks/usePost'
import { apiFetch } from '../utils/api'
import { buildSampleData, compileTemplate, extractTemplateVariables } from '../utils/templateUtils'

const IconPlus = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
)
const IconUpload = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
)
const IconCheck = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
)
const IconX = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
)
const IconTemplate = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
)

const CampaignStarter = () => {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: leads, loading: leadsLoading } = useFetch(`${import.meta.env.VITE_API}leads?refresh=${refreshKey}`, 'GET')
  const { data: profilesResponse, loading: profilesLoading } = useFetch(`${import.meta.env.VITE_API}getProfiles/`, 'GET')
  const { post: createCampaign, loading: submitting } = usePost(`${import.meta.env.VITE_API}campaign`)
  const { upload: uploadLead, loading: uploadingLead } = useFileUpload(`${import.meta.env.VITE_API}lead`)
  const fileInputRef = useRef(null)

  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [leadQuery, setLeadQuery] = useState('')

  const [form, setForm] = useState({ name: '', description: '', message: '', leads: [], browserProfile: '' })
  const [message, setMessage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true)
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API}templates`, {}, token)
        const data = await res.json()
        if (res.ok) setTemplates(data)
      } catch {
        setTemplates([])
      } finally {
        setTemplatesLoading(false)
      }
    }
    if (token) loadTemplates()
  }, [token])

  const messageVariables = useMemo(() => extractTemplateVariables(form.message), [form.message])
  const messagePreview = useMemo(
    () => (form.message ? compileTemplate(form.message, buildSampleData()) : ''),
    [form.message]
  )

  const profiles = profilesResponse?.profiles || []
  const leadList = Array.isArray(leads) ? leads : []

  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase()
    if (!q) return leadList
    return leadList.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.username?.toLowerCase().includes(q)
    )
  }, [leadList, leadQuery])

  const selectedLeads = useMemo(
    () => leadList.filter((lead) => form.leads.includes(lead._id)),
    [leadList, form.leads]
  )

  const toggleLead = (leadId) => {
    setForm((prev) => {
      const active = prev.leads.includes(leadId)
      return { ...prev, leads: active ? prev.leads.filter((id) => id !== leadId) : [...prev.leads, leadId] }
    })
  }

  const selectAllVisible = () => {
    setForm((prev) => {
      const ids = new Set(prev.leads)
      filteredLeads.forEach((l) => ids.add(l._id))
      return { ...prev, leads: [...ids] }
    })
  }

  const clearLeads = () => setForm((prev) => ({ ...prev, leads: [] }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'message') setSelectedTemplateId('')
  }

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value
    setSelectedTemplateId(templateId)
    if (!templateId) return
    const template = templates.find((t) => t._id === templateId)
    if (template) setForm((prev) => ({ ...prev, message: template.content }))
  }

  const handleUpload = async () => {
    setMessage(null)
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Pick a CSV first.' })
      return
    }
    try {
      await uploadLead(selectedFile)
      setMessage({ type: 'success', text: 'Leads uploaded.' })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed.' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Name required.' })
      return
    }
    if (!form.message.trim()) {
      setMessage({ type: 'error', text: 'Message required.' })
      return
    }
    if (!form.leads.length) {
      setMessage({ type: 'error', text: 'Pick at least one lead.' })
      return
    }
    if (!form.browserProfile) {
      setMessage({ type: 'error', text: 'Pick a browser profile.' })
      return
    }

    try {
      await createCampaign(form)
      setMessage({ type: 'success', text: 'Created.' })
      setForm({ name: '', description: '', message: '', leads: [], browserProfile: '' })
      setSelectedTemplateId('')
      navigate('/campaigns')
    } catch (err) {
      setMessage({ type: 'error', text: err.message || err || 'Failed.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
            {leadList.length} leads
          </span>
          <span className="rounded-md bg-slate-900 px-2 py-1 font-semibold text-white">
            {form.leads.length} selected
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
            {profiles.length} profiles
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting || leadsLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <IconPlus />
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            message.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Details</h2>
            </div>
            <div className="space-y-3.5 p-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Summer blast"
                  className="input-field"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Notes</span>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="input-field"
                />
              </label>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Message</span>
                  <Link
                    to="/templates"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <IconTemplate />
                    Templates
                  </Link>
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={handleTemplateSelect}
                  className="input-field"
                >
                  <option value="">
                    {templatesLoading ? 'Loading…' : 'Template (optional)'}
                  </option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="Hey {name} — use {username} for personalization"
                  rows={5}
                  className="input-field resize-none"
                />
                {messageVariables.length > 0 && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {messageVariables.map((v) => (
                        <span
                          key={v}
                          className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
                        >
                          {'{'}
                          {v}
                          {'}'}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      <span className="font-semibold text-slate-600">Preview </span>
                      {messagePreview}
                    </p>
                  </div>
                )}
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Profile</span>
                <select
                  name="browserProfile"
                  value={form.browserProfile}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="" disabled>
                    {profilesLoading ? 'Loading…' : 'Select profile'}
                  </option>
                  {profiles.map((profile) => (
                    <option key={profile._id} value={profile._id}>
                      {profile.profileName || profile._id}
                    </option>
                  ))}
                </select>
                {!profilesLoading && profiles.length === 0 && (
                  <p className="text-[11px] text-red-600">
                    No profiles — add one in{' '}
                    <Link to="/integrations" className="font-semibold underline">
                      Integrations
                    </Link>
                    .
                  </p>
                )}
              </label>
            </div>
          </div>

          {selectedLeads.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected · {selectedLeads.length}
                </h2>
                <button
                  type="button"
                  onClick={clearLeads}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3">
                {selectedLeads.map((lead) => (
                  <button
                    key={lead._id}
                    type="button"
                    onClick={() => toggleLead(lead._id)}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                    title="Remove"
                  >
                    {lead.name}
                    <IconX />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Leads · {leadList.length}
              </h2>
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={!filteredLeads.length}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
              >
                All
              </button>
            </div>

            <div className="border-b border-slate-100 p-3 space-y-2">
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

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center transition hover:border-slate-900 hover:bg-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                    <IconUpload />
                  </span>
                  <span className="text-xs font-semibold text-slate-800">Upload CSV</span>
                  <span className="text-[11px] text-slate-500">Click to pick a file</span>
                </button>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                      <IconUpload />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      title="Remove"
                    >
                      <IconX />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploadingLead}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <IconUpload />
                    {uploadingLead ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              )}

              {leadList.length > 0 && (
                <input
                  value={leadQuery}
                  onChange={(e) => setLeadQuery(e.target.value)}
                  placeholder="Search…"
                  className="input-field !py-1.5 text-xs"
                />
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
              {leadsLoading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-10" />
                  ))}
                </div>
              ) : filteredLeads.length ? (
                filteredLeads.map((lead) => {
                  const selected = form.leads.includes(lead._id)
                  return (
                    <button
                      key={lead._id}
                      type="button"
                      onClick={() => toggleLead(lead._id)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition ${
                        selected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? 'border-white/30 bg-white text-slate-900'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <IconCheck />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-xs font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>
                          {lead.name}
                        </span>
                        <span className={`block truncate text-[11px] ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {lead.username ? `@${lead.username}` : lead.email || '—'}
                        </span>
                      </span>
                    </button>
                  )
                })
              ) : (
                <div className="px-3 py-8 text-center text-xs text-slate-500">
                  {leadList.length ? 'No matches' : 'No leads yet — upload a CSV above'}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

export default CampaignStarter
