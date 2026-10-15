import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: number; message: string; tone: 'success' | 'info' }

const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {})

let nextId = 0

/** Short confirmation messages, bottom-centre, gone after a few seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = nextId++
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[24px] z-50 flex flex-col items-center gap-[8px]" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-center gap-[9px] rounded-[10px] px-[16px] py-[11px] text-body font-medium text-on-dark shadow-[0_8px_24px_rgba(14,26,23,0.18)] ${
              toast.tone === 'success' ? 'bg-t-green' : 'bg-teal-900'
            }`}
          >
            <span className="size-[7px] rounded-full bg-on-dark" />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
