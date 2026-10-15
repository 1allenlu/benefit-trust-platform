import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type SignupInput } from '../api'
import type { User } from '../data/mock'

type AuthContextValue = {
  user: User | null
  /** False until the initial session check finishes. */
  ready: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (input: SignupInput) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    authApi
      .getSession()
      .then(setUser, () => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const signedIn = await authApi.login(email, password)
    setUser(signedIn)
    return signedIn
  }, [])

  const signup = useCallback(async (input: SignupInput) => {
    const created = await authApi.signup(input)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, login, signup, logout }), [user, ready, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
