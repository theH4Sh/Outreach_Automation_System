import { useState } from "react";

export default function useFileUpload(url) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const upload = async (file) => {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const formData = new FormData()
            formData.append('file', file)

            // try to read token from localStorage (set at login)
            let token = null
            try {
                const auth = JSON.parse(localStorage.getItem('auth'))
                token = auth?.token || null
            } catch (e) {
                token = null
            }

            const headers = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')
            
            setSuccess(true)
            return await res.json()
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { upload, loading, error, success }
}
