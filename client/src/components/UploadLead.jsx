import { useState, useRef } from 'react'
import useFileUpload from '../hooks/useFileUpload'

const UploadLead = () => {
  const fileInputRef = useRef(null)
  const { upload, loading } = useFileUpload('http://localhost:4000/api/lead')
  const [message, setMessage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setMessage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a CSV file before uploading.' })
      return
    }

    try {
      await upload(selectedFile)
      setMessage({ type: 'success', text: 'Lead uploaded successfully!' })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed. Please try again.' })
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Upload</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Import lead data</h2>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">CSV only</div>
      </div>

      {message && (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Drag and drop your CSV here, or choose a file.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Select CSV file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
        </div>

        {selectedFile && (
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
                setMessage(null)
              }}
              className="mt-3 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:mt-0"
            >
              Change file
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Uploading...' : 'Upload leads'}
        </button>
      </div>
    </div>
  )
}

export default UploadLead
