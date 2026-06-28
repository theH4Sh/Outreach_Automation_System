import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';

const normalizeResponse = (json) => {
    if (Array.isArray(json)) return json
    if (json && typeof json === 'object' && json._id) return json
    if (json && typeof json === 'object' && Array.isArray(json.leads)) return json.leads
    return json
}

export default function useFetch (url, method) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const reduxToken = useSelector((state) => state?.auth?.token)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            let token = reduxToken || null
            if (!token) {
                try {
                    const auth = JSON.parse(localStorage.getItem('auth'))
                    token = auth?.token || null
                } catch {
                    token = null
                }
            }

            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            try {
                const res = await fetch(url, { method, headers })
                const json = await res.json()

                if (!res.ok) {
                    setError(json)
                    setData(normalizeResponse(json) ?? [])
                } else {
                    setData(normalizeResponse(json))
                }
            } catch (err) {
                setError(err)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [url, method, reduxToken])

    return { data, loading, error }
}