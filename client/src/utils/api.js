export const parseApiError = (data, fallback = 'Request failed') =>
  data?.error || data?.message || data?.detail || fallback

export const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export const getStoredToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    return auth?.token || null
  } catch {
    return null
  }
}

export const apiFetch = async (url, options = {}, tokenOverride = null) => {
  const token = tokenOverride || getStoredToken()
  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  })

  return res
}

export const adminFetch = async (token, path, options = {}) => {
  const res = await fetch(`${import.meta.env.VITE_API}admin${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }

  return data
}
