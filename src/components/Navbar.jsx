import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

function navClass({ isActive }) {
  return [
    'rounded-md px-3 py-1.5 text-sm font-medium transition',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
  ].join(' ')
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-auto text-lg font-semibold tracking-tight text-slate-900">
          🚆 TrainTracker
        </Link>

        <NavLink to="/" end className={navClass}>
          Buscar viajes
        </NavLink>
        <NavLink to="/my-tickets" className={navClass}>
          Mis billetes
        </NavLink>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
            <span className="text-sm text-slate-500">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Iniciar sesión
          </NavLink>
        )}
      </nav>
    </header>
  )
}
