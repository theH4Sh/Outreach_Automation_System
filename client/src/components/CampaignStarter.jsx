import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import usePost from '../hooks/usePost'

const CampaignStarter = () => {
  const { data: leads, loading: leadsLoading } = useFetch('http://localhost:4000/api/leads', 'GET')
  const { post: createCampaign, loading: submitting } = usePost('http://localhost:4000/api/campaign')
  const [form, setForm] = useState({ name: '', description: '', message: '', leads: [] })
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name === 'lead' ? 'leads' : name]: name === 'lead' ? (value ? [value] : []) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    try {
      await createCampaign(form)
      setMessage({ type: 'success', text: 'Campaign created!' })
      setForm({ name: '', description: '', message: '', leads: [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || err })
    }
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Campaign</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Create a new campaign</h2>
        </div>
        <p className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">{leads?.length ?? 0} leads available</p>
      </div>

      {message && (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Campaign name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ex: Summer Promo"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Lead</span>
            <select
              name="lead"
              value={form.leads[0] || ''}
              onChange={handleChange}
              required
              disabled={leadsLoading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            >
              <option value="">Select a lead...</option>
              {leads?.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add a short campaign summary"
            rows="3"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Write the campaign message to send"
            rows="4"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          />
        </label>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Build your campaign quickly and keep your messaging tight.</p>
          <button
            type="submit"
            disabled={submitting || leadsLoading}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Creating...' : 'Create campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CampaignStarter
