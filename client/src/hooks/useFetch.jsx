import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';

export default function useFetch (url, method) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // prefer token from Redux store, fallback to localStorage
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
                } catch (e) {
                    token = null
                }
            }

            const headers = {
                'Content-Type': 'application/json'
            }
            if (token) headers['Authorization'] = `Bearer ${token}`

            try {
                const res = await fetch(url, {
                    method: method,
                    headers
                })
                const json = await res.json()

                if (!res.ok) {
                    setError(json)
                    // ensure data consumers expecting arrays don't crash
                    setData(Array.isArray(json) ? json : (Array.isArray(json?.leads) ? json.leads : []))
                } else {
                    setData(Array.isArray(json) ? json : (Array.isArray(json?.leads) ? json.leads : json))
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