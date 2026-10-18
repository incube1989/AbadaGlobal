import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, login as apiLogin } from '../api/client'
import type { LoginRequest, User } from '../api/types'

const TOKEN_KEY = 'abadaglobal.token'

export type AuthStatus = 'loading' | 'anon' | 'authed'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  token: string | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  /** True when the user may access the moderation page (moderator+). */
  canModerate: boolean
  /** True when the user may access the administration page (administrator+). */
  canAdminister: boolean
  /** True when the user is a super admin. */
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )

  // Restore the session on mount: validate the stored token via /auth/me.
  useEffect(() => {
    let cancelled = false
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setStatus('anon')
      return
    }
    fetchMe(stored)
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authed')
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
        setStatus('anon')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await apiLogin(credentials)
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setUser(res.user)
    setStatus('authed')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setStatus('anon')
  }, [])

  const canModerate =
    user?.role === 'moderator' ||
    user?.role === 'administrator' ||
    user?.role === 'super admin'
  const canAdminister =
    user?.role === 'administrator' || user?.role === 'super admin'
  const isSuperAdmin = user?.role === 'super admin'

  const value = useMemo(
    () => ({ status, user, token, login, logout, canModerate, canAdminister, isSuperAdmin }),
    [status, user, token, login, logout, canModerate, canAdminister, isSuperAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}