import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex w-full items-center gap-[16px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <h1 className="text-h1 font-bold text-ink">{title}</h1>
        <p className="text-body text-mid">{subtitle}</p>
      </div>
      {actions}
    </div>
  )
}
