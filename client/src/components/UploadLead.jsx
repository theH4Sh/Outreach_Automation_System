import { useState, useRef } from 'react'
import useFileUpload from '../hooks/useFileUpload'

const UploadLead = () => {
  const fileInputRef = useRef(null)
  const { upload, loading } = useFileUpload(`${import.meta.env.VITE_API}lead`)
  const [message, setMessage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file) => {
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
      setMessage({ type: 'success', text: 'Leads uploaded successfully!' })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed. Please try again.' })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          dragOver
            ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFileSelect(e.dataTransfer.files?.[0])
        }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {selectedFile ? (
          <>
            <p className="font-semibold text-slate-900">{selectedFile.name}</p>
            <p className="mt-1 text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB · CSV</p>
            <button
              type="button"
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="mt-3 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Choose a different file
            </button>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-800">Drop your CSV here</p>
            <p className="mt-1 text-sm text-slate-500">or click to browse files</p>
          </>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 btn-primary"
        >
          Select CSV file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          disabled={loading}
          className="hidden"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !selectedFile}
        className="btn-primary w-full py-3"
      >
        {loading ? 'Uploading…' : 'Upload leads'}
      </button>
    </div>
  )
}

export default UploadLead
