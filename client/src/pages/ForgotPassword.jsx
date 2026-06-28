import { useState } from "react";
import { Link } from "react-router";
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(import.meta.env.VITE_API + "auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">← Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
