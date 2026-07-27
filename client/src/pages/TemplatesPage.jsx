import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import DeleteTemplateModal from '../components/DeleteTemplateModal'
import { apiFetch } from '../utils/api'
import {
  PERSONALIZATION_FIELDS,
  buildSampleData,
  compileTemplate,
  extractTemplateVariables,
} from '../utils/templateUtils'

const emptyForm = { name: '', description: '', content: '' }

const TemplatesPage = () => {
  const { token } = useSelector((state) => state.auth)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const variables = useMemo(() => extractTemplateVariables(form.content), [form.content])
  const preview = useMemo(
    () => compileTemplate(form.content, buildSampleData()),
    [form.content]
  )

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API}templates`, {}, token)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load templates')
      setTemplates(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTemplates() }, [token])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (template) => {
    setEditingId(template._id)
    setForm({
      name: template.name,
      description: template.description || '',
      content: template.content,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const insertVariable = (key) => {
    setForm((prev) => ({
      ...prev,
      content: `${prev.content}${prev.content && !prev.content.endsWith(' ') ? ' ' : ''}{${key}}`,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId
        ? `${import.meta.env.VITE_API}templates/${editingId}`
        : `${import.meta.env.VITE_API}templates`

      const res = await apiFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      }, token)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save template')

      toast.success(editingId ? 'Template updated' : 'Template created')
      closeForm()
      await loadTemplates()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_API}templates/${deleteTarget._id}`,
        { method: 'DELETE' },
        token
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete template')

      toast.success('Template deleted')
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      await loadTemplates()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-6 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-500 blur-[70px] opacity-40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300 font-medium">Message templates</p>
            <h2 className="mt-1 text-xl font-bold">Reusable outreach messages</h2>
            <p className="mt-1 text-sm text-slate-400">Use {'{name}'}, {'{username}'}, and other fields for personalization.</p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary shrink-0 bg-white text-slate-900 hover:bg-violet-50 shadow-none">
            + New template
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit template' : 'Create new template'}
            </h3>
            <button type="button" onClick={closeForm} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Template name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Warm intro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <input
                  className="input-field"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short note for your team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message content</label>
                <textarea
                  className="input-field resize-none min-h-[160px]"
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Hey {name}, loved your profile @{username}..."
                  required
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Insert personalization</p>
                <div className="flex flex-wrap gap-2">
                  {PERSONALIZATION_FIELDS.map((field) => (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => insertVariable(field.key)}
                      className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                    >
                      + {'{'}{field.key}{'}'}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create template'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-sm font-bold text-slate-900">Live preview</h4>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {form.content ? preview : 'Start typing to see a personalized preview…'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-sm font-bold text-slate-900">Detected variables</h4>
                {variables.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variables.map((v) => (
                      <span key={v} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {'{'}{v}{'}'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No variables yet. Add {'{name}'} or similar.</p>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="font-semibold text-slate-700">No templates yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first reusable message template.</p>
          <button type="button" onClick={openCreate} className="btn-primary mt-4">Create template</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{template.name}</h3>
                  {template.description && (
                    <p className="mt-1 text-sm text-slate-500">{template.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(template)}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeleteTarget(template); setDeleteModalOpen(true) }}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{template.content}</p>

              {template.variables?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {template.variables.map((v) => (
                    <span key={v} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {'{'}{v}{'}'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteTemplateModal
        isOpen={deleteModalOpen}
        template={deleteTarget}
        loading={deleting}
        onClose={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget(null) } }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default TemplatesPage
