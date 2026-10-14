import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

type AllowedRole = 'student' | 'admin' | 'instructor'

type ProtectedRouteProps = {
  allowedRoles?: AllowedRole[]
}

export function ProtectedRoute({ allowedRoles = ['admin', 'instructor'] }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <section className="information-page"><div className="information-page-copy"><p>Kontrollerar inloggning…</p></div></section>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  const normalizedRoles = user.roles.map((role) => role.trim().toLowerCase())
  const hasRequiredRole = allowedRoles.some((role) => normalizedRoles.includes(role))

  if (!hasRequiredRole) {
    return <Navigate to="/ingen-behorighet" replace />
  }

  return <Outlet />
}
