import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(import.meta.env.VITE_API + 'auth/signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            const firstKey = Object.keys(data)[0]
            throw new Error(data[firstKey][0])
          })
        }
        return res.json()
      })
      .then(() => {
        toast.success("Account created! Please sign in.")
        navigate('/login')
      })
      .catch((err) => toast.error(`${err}`))
  }

  return (
    <AuthLayout title="Create your account" subtitle="Get started with OAS in seconds">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
          <input id="username" type="text" required className="input-field" placeholder="User_123" onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input id="email" type="email" required className="input-field" placeholder="you@example.com" onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input id="password" type="password" required className="input-field" placeholder="••••••••" onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary w-full py-3">Create Account</button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
