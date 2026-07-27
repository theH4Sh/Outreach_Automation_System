import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux"
import { login } from '../slice/authSlice.js';
import AuthLayout from '../components/AuthLayout';
import { parseApiError } from '../utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const fd = new FormData(e.currentTarget)
    const identifier = String(fd.get('identifier') || formData.identifier || '').trim()
    const password = String(fd.get('password') || formData.password || '')

    if (!identifier || !password) {
      toast.error('Enter your username/email and password')
      return
    }

    setLoading(true)

    fetch(import.meta.env.VITE_API + 'auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(parseApiError(data, 'Login failed'))
        }
        return data
      })
      .then((data) => {
        dispatch(login(data))
        toast.success("Welcome back!")
        localStorage.setItem('auth', JSON.stringify({
          username: data.username,
          token: data.token,
          role: data.role,
          isAuthenticated: true
        }))
        navigate('/')
      })
      .catch((err) => toast.error(err.message || 'Login failed'))
      .finally(() => setLoading(false))
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email or Username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            className="input-field"
            placeholder="username or email"
            value={formData.identifier}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input-field"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm text-slate-500">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create one
          </Link>
        </p>
        <p>
          <Link to="/forgot-password" className="font-medium text-slate-400 hover:text-slate-600">
            Forgot your password?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
