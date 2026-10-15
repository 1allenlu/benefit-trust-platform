import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  className?: string
}

/** White bordered card used for the page's content sections. */
export function Panel({ children, className = '' }: PanelProps) {
  return (
    <section className={`flex flex-col rounded-[12px] border border-line bg-surface px-[20px] pt-[18px] pb-[20px] ${className}`}>
      {children}
    </section>
  )
}
