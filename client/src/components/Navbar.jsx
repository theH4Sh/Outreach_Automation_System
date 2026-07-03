import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { logout } from '../slice/authSlice'
import toast from 'react-hot-toast'

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { username, role } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('auth')
    toast.success('Logged out successfully')
    navigate('/')
  }

  const initials = username?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/60">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">OAS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/settings" className="hidden sm:block text-right transition hover:opacity-80">
            <p className="text-sm font-semibold text-slate-900">{username}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">{role}</p>
          </Link>

          <Link to="/settings" className="relative" title="Account settings">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-brand opacity-60 blur-sm" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-dark text-sm font-bold text-white">
              {initials}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
