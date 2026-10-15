import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  /** Width in px. */
  width?: number
}

/** Centered dialog with a dimmed backdrop. Escape or a backdrop click closes it. */
export function Modal({ title, subtitle, onClose, children, width = 480 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[rgba(14,26,23,0.35)] px-[16px] pt-[96px] pb-[40px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex w-full flex-col gap-[16px] rounded-[12px] border border-line bg-surface px-[24px] pt-[22px] pb-[24px] shadow-[0_16px_48px_rgba(14,26,23,0.18)]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start gap-[12px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <h2 className="text-h2 font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-small text-light">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-[2px] cursor-pointer rounded-[6px] px-[6px] text-[20px] leading-[24px] text-light hover:bg-soft hover:text-ink"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
