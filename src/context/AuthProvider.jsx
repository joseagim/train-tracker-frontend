import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import { AuthContext } from './auth-context'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getStoredUser())

  const logout = useCallback(() => {
    api.clearSession()
    setUser(null)
  }, [])

  // Si cualquier petición protegida recibe 401/403, cerramos sesión.
  useEffect(() => {
    api.setUnauthorizedHandler(logout)
    return () => api.setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (credentials) => {
    const session = await api.login(credentials)
    api.saveSession(session)
    // El perfil se guarda sin el token (que vive aparte en localStorage).
    const profile = api.getStoredUser()
    setUser(profile)
    return profile
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isAdmin: user?.role === 'ROLE_ADMIN', login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
