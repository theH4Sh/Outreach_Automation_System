import { useState, useRef } from "react"
import useFileUpload from "../hooks/useFileUpload"

const UploadLead = () => {
    const fileInputRef = useRef(null)
    const { upload, loading, error, success } = useFileUpload('http://localhost:4000/api/lead')
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
            setMessage({ type: 'error', text: 'Please select a file' })
            return
        }

        try {
            await upload(selectedFile)
            setMessage({ type: 'success', text: 'Lead uploaded successfully!' })
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
            setMessage({ type: 'error', text: error })
        }
    }

    return (
        <div className="flex justify-center m-1">
            <form onSubmit={handleSubmit} className="flex flex-col text-start bg-gray-50 rounded-xl p-5 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Upload Lead</h2>

                {message && (
                    <div className={`px-4 py-2 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <label className="font-semibold">Select CSV File</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="border rounded-lg p-2 my-1"
                />

                {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                        Selected: <span className="font-semibold">{selectedFile.name}</span>
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    {loading ? 'Uploading...' : 'Upload Lead'}
                </button>
            </form>
        </div>
    )
}

export default UploadLead