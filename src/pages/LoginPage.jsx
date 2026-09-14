import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import { useAuth } from '../context/auth-context'
import * as api from '../services/api'

const EMPTY_REGISTER = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dni: '',
  password: '',
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200'
const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Destino al que volver tras autenticarse (lo deja ProtectedRoute).
  const from = location.state?.from

  function goBackToIntent() {
    if (from?.pathname) {
      navigate(from.pathname, { replace: true, state: from.state })
    } else {
      navigate('/', { replace: true })
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginForm)
      goBackToIntent()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register(registerForm)
      // El registro no devuelve token: iniciamos sesión con las mismas credenciales.
      await login({ email: registerForm.email, password: registerForm.password })
      goBackToIntent()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {from && (
        <div className="mb-4">
          <Alert type="info">Inicia sesión para continuar.</Alert>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="login-password">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <Alert>{error}</Alert>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="reg-firstName">
                  Nombre
                </label>
                <input
                  id="reg-firstName"
                  required
                  className={inputClass}
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="reg-lastName">
                  Apellidos
                </label>
                <input
                  id="reg-lastName"
                  required
                  className={inputClass}
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="reg-phone">
                  Teléfono
                </label>
                <input
                  id="reg-phone"
                  required
                  className={inputClass}
                  value={registerForm.phoneNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="reg-dni">
                  DNI
                </label>
                <input
                  id="reg-dni"
                  required
                  className={inputClass}
                  value={registerForm.dni}
                  onChange={(e) => setRegisterForm({ ...registerForm, dni: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="reg-password">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                maxLength={20}
                autoComplete="new-password"
                className={inputClass}
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">Entre 8 y 20 caracteres.</p>
            </div>

            <Alert>{error}</Alert>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
