import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Guardamos la ubicación completa (incluido su state) para volver
    // al mismo punto tras iniciar sesión.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
