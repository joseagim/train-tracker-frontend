import { DEFAULT_LANGUAGE, translations } from '../i18n/translations'

// En desarrollo usamos rutas relativas para que las sirva el proxy de Vite
// (ver vite.config.js): la API no envía cabeceras CORS y el navegador
// bloquearía las respuestas si llamásemos directamente a su dominio.
const BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL

const TOKEN_KEY = 'tt_token'
const USER_KEY = 'tt_user'

// Callback que AuthProvider registra para cerrar sesión cuando la API
// responde 401 (token caducado o inválido).
let unauthorizedHandler = null

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

// Idioma que LanguageProvider mantiene sincronizado, para poder traducir los
// mensajes de error que genera este módulo (los que sí controlamos: fallos
// de red, sesión caducada... no los que ya llegan redactados desde la API).
let currentLanguage = DEFAULT_LANGUAGE

export function setApiLanguage(language) {
  currentLanguage = language
}

function apiErrorText(key) {
  return translations[currentLanguage]?.apiErrors?.[key] ?? translations[DEFAULT_LANGUAGE].apiErrors[key]
}

/* ---------- Token / usuario en localStorage ---------- */

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession({ token, ...user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/* ---------- Cliente HTTP ---------- */

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (!token) {
      if (unauthorizedHandler) unauthorizedHandler()
      throw new ApiError(apiErrorText('mustSignIn'), 401)
    }
    headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(apiErrorText('networkError'), 0)
  }

  if (res.status === 401 || res.status === 403) {
    if (auth && unauthorizedHandler) unauthorizedHandler()
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    // La API devuelve { message, status, timestamp, path, method }.
    // 401/403 pueden llegar con cuerpo vacío desde el filtro de seguridad.
    const fallback =
      res.status === 401 || res.status === 403
        ? apiErrorText('sessionExpired')
        : apiErrorText('genericError').replace('{status}', res.status)
    const message = data?.message || text || fallback
    throw new ApiError(message, res.status)
  }

  return data
}

/* ---------- Endpoints ---------- */

export function register({ firstName, lastName, email, phoneNumber, dni, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { firstName, lastName, email, phoneNumber, dni, password },
  })
}

export function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

// La respuesta viene paginada (Spring Page): devolvemos solo el contenido.
export async function getStations() {
  const page = await request('/api/stations?page=0&size=100&sort=name,asc')
  return page?.content ?? []
}

export function searchTrips({ from, to, date, passengers }) {
  const params = new URLSearchParams({
    from: String(from),
    to: String(to),
    date,
    passengers: String(passengers),
  })
  return request(`/api/trips/search?${params}`)
}

export function purchaseTicket({ tripId, origin, destination }) {
  return request('/api/tickets', {
    method: 'POST',
    auth: true,
    body: { tripId, origin, destination },
  })
}

export function getMyTickets() {
  return request('/api/tickets/my-tickets', { auth: true })
}

export function validateTicket(uuid) {
  return request(`/api/tickets/validate/${encodeURIComponent(uuid)}`, { auth: true })
}

export function scanTicket(uuid) {
  return request(`/api/tickets/scan/${encodeURIComponent(uuid)}`, { method: 'POST', auth: true })
}
