import { useState } from "react";

export default function usePost(url) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const post = async (data) => {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            let token = null
            try {
                const auth = JSON.parse(localStorage.getItem('auth'))
                token = auth?.token || null
            } catch (e) {
                token = null
            }

            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Request failed')
            
            setSuccess(true)
            return await res.json()
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { post, loading, error, success }
}
