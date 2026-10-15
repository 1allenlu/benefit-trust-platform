import { useCallback, useEffect, useState, type DependencyList } from 'react'

export type ApiState<T> = {
  data: T | undefined
  error: Error | undefined
  loading: boolean
}

/**
 * Runs `load` whenever `deps` change. Keeps the previous data while a reload is in
 * flight, so filtered lists don't flash empty.
 */
export function useApi<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: undefined, loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, error: undefined, loading: true }))
    load().then(
      (data) => !cancelled && setState({ data, error: undefined, loading: false }),
      (error: Error) => !cancelled && setState((prev) => ({ ...prev, error, loading: false })),
    )
    return () => {
      cancelled = true
    }
    // `load` is recreated every render; `deps` says when it actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
