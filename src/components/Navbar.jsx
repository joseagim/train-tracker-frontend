import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.webp'
import { useAuth } from '../context/auth-context'
import { useLanguage } from '../context/language-context'
import Button, { buttonClasses } from './ui/Button'
import LanguageSwitcher from './LanguageSwitcher'
import { truncate } from '../utils/format'

const MAX_NAME_LENGTH = 30

function navClass({ isActive }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700',
  ].join(' ')
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-4">
        <Link to="/" className="flex shrink-0 items-center">
          <img src={logo} alt="TrainTracker" className="h-14 w-auto -my-3" />
        </Link>

        {/* El logo nunca se envuelve: este grupo ocupa el resto del ancho y,
            si su contenido no cabe, sus propias líneas quedan pegadas al
            borde derecho (no a la izquierda, bajo el logo). */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
          <NavLink to="/" end className={navClass}>
            {t('nav.searchTrips')}
          </NavLink>
          <NavLink to="/my-tickets" className={navClass}>
            {t('nav.myTickets')}
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/validate-qr" className={navClass}>
              {t('nav.validateQr')}
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <span className="text-sm text-slate-500" title={`${user.firstName} ${user.lastName}`}>
                {truncate(`${user.firstName} ${user.lastName}`, MAX_NAME_LENGTH)}
              </span>
              <Button type="button" variant="outline-danger" size="sm" onClick={handleLogout}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="border-l border-slate-200 pl-3">
              <NavLink to="/login" className={buttonClasses({ variant: 'outline-brand', size: 'sm' })}>
                {t('nav.login')}
              </NavLink>
            </div>
          )}

          <div className="border-l border-slate-200 pl-3">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </header>
  )
}
