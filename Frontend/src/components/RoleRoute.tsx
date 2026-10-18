import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../api/types'
import Restricted from '../pages/Restricted'

interface RoleRouteProps {
  children: ReactNode
  /** Roles allowed to see the children. */
  roles: UserRole[]
}

/**
 * Guards role-restricted routes (moderation / administration). Users without
 * the required role see the logged-in restricted page.
 */
export default function RoleRoute({ children, roles }: RoleRouteProps) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) {
    return <Restricted />
  }
  return <>{children}</>
}