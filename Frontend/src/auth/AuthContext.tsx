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

  const value = useMemo(
    () => ({ status, user, token, login, logout }),
    [status, user, token, login, logout],
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