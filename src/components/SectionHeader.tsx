import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  /** Rendered on the right side of the header. */
  action?: ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex w-full items-center gap-[10px]">
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <h2 className="text-h2 font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-small text-light">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
