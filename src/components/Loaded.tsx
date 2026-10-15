import type { ReactNode } from 'react'
import type { ApiState } from '../hooks/useApi'
import { PageStatus } from './PageStatus'

type LoadedProps<T> = {
  state: ApiState<T> & { retry: () => void }
  children: (data: T) => ReactNode
}

/** Renders children once data is in; a spinner or retryable error until then. */
export function Loaded<T>({ state, children }: LoadedProps<T>) {
  if (state.data !== undefined) return children(state.data)
  return <PageStatus loading={state.loading} error={state.error} onRetry={state.retry} />
}
