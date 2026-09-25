import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import { useAuth } from '../context/auth-context'
import { useLanguage } from '../context/language-context'
import useDocumentTitle from '../hooks/useDocumentTitle'
import * as api from '../services/api'

const EMPTY_REGISTER = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dni: '',
  password: '',
}

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const tabRefs = useRef({})
  const errorRef = useRef(null)
  const skipAlertFocusRef = useRef(false)

  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const TABS = [
    { mode: 'login', label: t('login.tabLogin'), tabId: 'tab-login', panelId: 'panel-login' },
    { mode: 'register', label: t('login.tabRegister'), tabId: 'tab-register', panelId: 'panel-register' },
  ]

  // Mensajes propios para sustituir la burbuja de validación nativa del navegador.
  // Un campo obligatorio vacío no necesita texto propio: el asterisco de la
  // etiqueta y el borde rojo ya lo indican (devolvemos `true` para marcarlo
  // como inválido sin mostrar mensaje).
  function fieldErrorMessage(el) {
    const { validity } = el
    if (validity.valueMissing) return true
    if (validity.typeMismatch) return t('login.invalidEmail')
    if (validity.tooShort) return t('login.tooShort', { count: el.minLength })
    if (validity.tooLong) return t('login.tooLong', { count: el.maxLength })
    return true
  }

  useDocumentTitle(mode === 'login' ? t('login.docTitleLogin') : t('login.docTitleRegister'))

  useEffect(() => {
    if (!error) return
    if (skipAlertFocusRef.current) {
      skipAlertFocusRef.current = false
      return
    }
    errorRef.current?.focus()
  }, [error])

  function clearFieldError(id) {
    setFieldErrors((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Sustituye la validación nativa del navegador: marca los campos inválidos
  // en rojo, enfoca el primero y muestra el aviso junto al botón de enviar.
  function validateForm(formEl) {
    if (formEl.checkValidity()) return true
    const invalidEls = [...formEl.querySelectorAll(':invalid')]
    const errors = {}
    invalidEls.forEach((el) => {
      errors[el.id] = fieldErrorMessage(el)
    })
    setFieldErrors(errors)
    skipAlertFocusRef.current = true
    setError(t('common.requiredFields'))
    invalidEls[0]?.focus()
    return false
  }

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
    setFieldErrors({})
  }

  function handleTabKeyDown(event) {
    const currentIndex = TABS.findIndex((tab) => tab.mode === mode)
    let nextIndex = null

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TABS.length - 1

    if (nextIndex === null) return
    event.preventDefault()
    const next = TABS[nextIndex]
    switchMode(next.mode)
    tabRefs.current[next.mode]?.focus()
  }

  async function handleLogin(event) {
    event.preventDefault()
    setFieldErrors({})
    if (!validateForm(event.currentTarget)) return
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
    setFieldErrors({})
    if (!validateForm(event.currentTarget)) return
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
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">{t('login.heading')}</h1>

      <div
        role="tablist"
        aria-label={t('login.tablistLabel')}
        onKeyDown={handleTabKeyDown}
        className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            ref={(el) => (tabRefs.current[tab.mode] = el)}
            type="button"
            role="tab"
            id={tab.tabId}
            aria-selected={mode === tab.mode}
            aria-controls={tab.panelId}
            tabIndex={mode === tab.mode ? 0 : -1}
            onClick={() => switchMode(tab.mode)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === tab.mode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {from && (
        <div className="mb-4">
          <Alert type="info">{t('login.continueNotice')}</Alert>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {mode === 'login' ? (
          <form
            id={TABS[0].panelId}
            role="tabpanel"
            aria-labelledby={TABS[0].tabId}
            tabIndex={0}
            onSubmit={handleLogin}
            noValidate
            className="space-y-4"
          >
            <Input
              id="login-email"
              label={t('login.email')}
              type="email"
              required
              autoComplete="email"
              error={fieldErrors['login-email']}
              value={loginForm.email}
              onChange={(e) => {
                setLoginForm({ ...loginForm, email: e.target.value })
                clearFieldError('login-email')
              }}
            />
            <PasswordInput
              id="login-password"
              label={t('login.password')}
              required
              autoComplete="current-password"
              error={fieldErrors['login-password']}
              value={loginForm.password}
              onChange={(e) => {
                setLoginForm({ ...loginForm, password: e.target.value })
                clearFieldError('login-password')
              }}
            />

            <Alert ref={errorRef} id="login-error">
              {error}
            </Alert>

            <button
              type="submit"
              disabled={loading}
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>
        ) : (
          <form
            id={TABS[1].panelId}
            role="tabpanel"
            aria-labelledby={TABS[1].tabId}
            tabIndex={0}
            onSubmit={handleRegister}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="reg-firstName"
                label={t('login.firstName')}
                required
                error={fieldErrors['reg-firstName']}
                value={registerForm.firstName}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, firstName: e.target.value })
                  clearFieldError('reg-firstName')
                }}
              />
              <Input
                id="reg-lastName"
                label={t('login.lastName')}
                required
                error={fieldErrors['reg-lastName']}
                value={registerForm.lastName}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, lastName: e.target.value })
                  clearFieldError('reg-lastName')
                }}
              />
            </div>

            <Input
              id="reg-email"
              label={t('login.email')}
              type="email"
              required
              autoComplete="email"
              error={fieldErrors['reg-email']}
              value={registerForm.email}
              onChange={(e) => {
                setRegisterForm({ ...registerForm, email: e.target.value })
                clearFieldError('reg-email')
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="reg-phone"
                label={t('login.phone')}
                required
                error={fieldErrors['reg-phone']}
                value={registerForm.phoneNumber}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, phoneNumber: e.target.value })
                  clearFieldError('reg-phone')
                }}
              />
              <Input
                id="reg-dni"
                label={t('login.dni')}
                required
                error={fieldErrors['reg-dni']}
                value={registerForm.dni}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, dni: e.target.value })
                  clearFieldError('reg-dni')
                }}
              />
            </div>

            <PasswordInput
              id="reg-password"
              label={t('login.password')}
              required
              minLength={8}
              maxLength={20}
              autoComplete="new-password"
              hint={t('login.passwordHint')}
              error={fieldErrors['reg-password']}
              value={registerForm.password}
              onChange={(e) => {
                setRegisterForm({ ...registerForm, password: e.target.value })
                clearFieldError('reg-password')
              }}
            />

            <Alert ref={errorRef} id="register-error">
              {error}
            </Alert>

            <button
              type="submit"
              disabled={loading}
              aria-describedby={error ? 'register-error' : undefined}
              className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? t('login.creatingAccount') : t('login.createAccount')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
