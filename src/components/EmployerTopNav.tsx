import { Link } from 'react-router'
import { TabItem } from './TabItem'

type EmployerTopNavProps = {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  orgLabel: string
}

/** Employer-side navigation. Teal identity keeps it distinct from the employee green. */
export function EmployerTopNav({ tabs, activeTab, onTabChange, orgLabel }: EmployerTopNavProps) {
  return (
    <header className="flex w-full flex-col bg-surface">
      <div className="flex h-[60px] items-center gap-[20px] px-[40px]">
        <Link to="/" className="flex shrink-0 items-center gap-[9px]">
          <span className="size-[24px] rounded-[7px] bg-teal-900" />
          <span className="text-h2 font-semibold text-ink">Vested</span>
          <span className="rounded-[5px] bg-teal-100 px-[8px] py-[3px] text-cap font-semibold text-t-teal uppercase">
            Employer
          </span>
        </Link>
        <div className="flex-1" />
        <Link to="/" className="text-small font-medium text-t-link hover:underline">
          View as an employee ↗
        </Link>
        <span className="text-body text-mid">{orgLabel}</span>
        <span className="size-[30px] rounded-full bg-teal-100" />
      </div>
      <nav className="flex h-[44px] items-center gap-[4px] border-b border-line px-[40px]" role="tablist">
        {tabs.map((tab) => (
          <TabItem
            key={tab}
            label={tab}
            active={tab === activeTab}
            onClick={() => onTabChange(tab)}
            tone="teal"
            xPadClassName="px-[12px]"
            yPadClassName="pt-[12px] pb-[10px]"
          />
        ))}
      </nav>
    </header>
  )
}
