import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { PageStatus } from '../components/PageStatus'
import { useAuth } from './AuthContext'

/** Sends signed-out visitors to /login, then back here after they sign in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <PageStatus loading />
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return children
}
