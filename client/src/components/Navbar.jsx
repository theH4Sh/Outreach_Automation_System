import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { logout } from '../slice/authSlice'
import toast from 'react-hot-toast'

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { username, role } = useSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(logout())
        localStorage.removeItem("auth")
        toast.success("logged out successfully")
        navigate('/')
    };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 lg:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* User Info Section */}
        <div className="ml-auto flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold text-slate-900">{username}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-semibold">
              {username?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
