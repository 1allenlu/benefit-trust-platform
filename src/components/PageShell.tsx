import type { ReactNode } from 'react'
import { navTabs } from '../data/mock'
import { TopNav } from './TopNav'

type PageShellProps = {
  activeTab: string
  children: ReactNode
  /** Render children without the standard padded body, e.g. for pages with a hero. */
  bare?: boolean
}

export function PageShell({ activeTab, children, bare = false }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <TopNav tabs={navTabs} activeTab={activeTab} />
      {bare ? children : <main className="flex w-full flex-col gap-[18px] px-[40px] pt-[22px] pb-[44px]">{children}</main>}
    </div>
  )
}
