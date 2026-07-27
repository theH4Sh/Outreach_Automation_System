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
    toast.success('Logged out')
    navigate('/')
  }

  const initials = username?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-12 items-center justify-between gap-3 px-3 sm:px-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
              O
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">OAS</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-slate-50"
            title="Settings"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
              {initials}
            </span>
            <span className="hidden sm:flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-semibold text-slate-900 max-w-[120px]">{username}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {role === 'admin' ? 'Admin' : role || 'User'}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
