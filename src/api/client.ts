/**
 * Every request goes through here. With VITE_API_URL set it calls the real backend;
 * otherwise it answers from the mock handler after a short delay, so loading states
 * behave the same either way.
 */

const API_URL: string | undefined = import.meta.env.VITE_API_URL || undefined
const MOCK_LATENCY_MS = 250

export const isMockApi = !API_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RequestOptions<T> = {
  method?: Method
  body?: unknown
  /** Answers the request while no backend is configured. */
  mock: () => T
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function request<T>(path: string, { method = 'GET', body, mock }: RequestOptions<T>): Promise<T> {
  if (!API_URL) {
    await delay(MOCK_LATENCY_MS)
    // Copy so callers can't mutate the shared mock data.
    return structuredClone(mock())
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new ApiError(res.status, payload?.message ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
