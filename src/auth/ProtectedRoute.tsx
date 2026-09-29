import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <section className="information-page"><div className="information-page-copy"><p>Kontrollerar inloggning…</p></div></section>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.roles.some((role) => role.toLowerCase() === 'admin' || role.toLowerCase() === 'instructor')) {
    return <Navigate to="/ingen-behorighet" replace />
  }
  return <Outlet />
}
