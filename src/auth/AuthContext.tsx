import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiRequestError, clearCsrfRequestToken, isApiConfigured } from '../api/client'
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, type AuthUser, type RegisterPayload } from '../api/authApi'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!isApiConfigured) {
      setLoading(false)
      return () => { active = false }
    }

    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch((requestError: unknown) => {
        if (!active) return
        if (!(requestError instanceof ApiRequestError && requestError.status === 401)) {
          setError(requestError instanceof Error ? requestError.message : 'Kunde inte kontrollera inloggningen.')
        }
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await apiLogin(email, password)
      setUser(await getCurrentUser())
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Inloggningen misslyckades. Försök igen.'
      setError(message)
      throw requestError
    }
  }, [])

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setError(null)
    try {
      await apiRegister(payload)
      setUser(await getCurrentUser())
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Registreringen misslyckades. Försök igen.'
      setError(message)
      throw requestError
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await apiLogout()
    } finally {
      setUser(null)
      clearCsrfRequestToken()
    }
  }, [])

  const value = useMemo(() => ({ user, loading, error, signIn, signUp, signOut, clearError: () => setError(null) }), [user, loading, error, signIn, signUp, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth måste användas inom AuthProvider.')
  return context
}
