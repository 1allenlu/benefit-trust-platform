import { mockAccounts, type User } from '../data/mock'
import { ApiError, request } from './client'

const ACCOUNTS_KEY = 'vested.mock.accounts'
const SESSION_KEY = 'vested.mock.session'

/*
 * Mock-only persistence: stands in for the backend's user table and session cookie.
 * Storage can be unavailable (private mode), so every access is guarded.
 */
function readAccounts(): typeof mockAccounts {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // fall through to the seed accounts
  }
  return mockAccounts
}

function writeAccounts(accounts: typeof mockAccounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // session-only accounts are fine for a mock
  }
}

function setSession(userId: string | null) {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

function getSessionUser(): User | null {
  try {
    const userId = localStorage.getItem(SESSION_KEY)
    return readAccounts().find((a) => a.user.id === userId)?.user ?? null
  } catch {
    return null
  }
}

export type SignupInput = { name: string; email: string; password: string }

function shortNameFrom(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  return last ? `${first} ${last[0].toUpperCase()}.` : first
}

export const authApi = {
  getSession: () => request<User | null>('/auth/session', { mock: getSessionUser }),

  login: (email: string, password: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: { email, password },
      mock: () => {
        const account = readAccounts().find(
          (a) => a.user.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
        )
        if (!account) throw new ApiError(401, 'That email and password don’t match an account.')
        setSession(account.user.id)
        return account.user
      },
    }),

  signup: ({ name, email, password }: SignupInput) =>
    request<User>('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
      mock: () => {
        const accounts = readAccounts()
        const normalized = email.trim().toLowerCase()
        if (accounts.some((a) => a.user.email.toLowerCase() === normalized)) {
          throw new ApiError(409, 'An account with this email already exists. Try logging in.')
        }
        const user: User = {
          id: `u-${crypto.randomUUID()}`,
          firstName: name.trim().split(/\s+/)[0],
          shortName: shortNameFrom(name),
          email: normalized,
        }
        writeAccounts([...accounts, { user, password }])
        setSession(user.id)
        return user
      },
    }),

  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST',
      mock: () => setSession(null),
    }),
}
