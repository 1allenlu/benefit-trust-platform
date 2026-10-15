import { Button } from './Button'

type PageStatusProps = {
  loading?: boolean
  error?: Error
  onRetry?: () => void
}

/** Placeholder for a page body while its data loads or after it fails. */
export function PageStatus({ loading, error, onRetry }: PageStatusProps) {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-[12px] text-center" role="status">
      {error ? (
        <>
          <p className="text-h2 font-semibold text-ink">Couldn’t load this page</p>
          <p className="text-body text-mid">{error.message}</p>
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
        </>
      ) : (
        loading && (
          <>
            <span className="size-[24px] animate-spin rounded-full border-[3px] border-line border-t-green" />
            <p className="text-small text-light">Loading…</p>
          </>
        )
      )}
    </div>
  )
}
