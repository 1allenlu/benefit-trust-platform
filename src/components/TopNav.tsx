import { Link } from 'react-router'
import arrowRightIcon from '../assets/icons/arrow-right.svg'
import plusCircleIcon from '../assets/icons/plus-circle.svg'
import { contentApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../hooks/useApi'
import type { NavTab } from '../data/mock'
import { AccountMenu } from './AccountMenu'
import { Button } from './Button'
import { NavMenu } from './NavMenu'
import { NavSearch } from './NavSearch'
import { Notifications } from './Notifications'
import { TabItem } from './TabItem'

type TopNavProps = {
  tabs: NavTab[]
  activeTab: string
}

export function TopNav({ tabs, activeTab }: TopNavProps) {
  const { user, ready } = useAuth()
  const companyIndex = useApi(() => contentApi.listCompanies(), [])
  const menus: Record<string, { label: string; detail?: string; to: string }[]> = {
    explore: [
      { label: 'Benefits by company', to: '/' },
      { label: 'Rank by 401(k) match', to: '/?q=401(k)' },
      { label: 'Rank by parental leave', to: '/?q=parental leave' },
      { label: 'Rank by health coverage', to: '/?q=health' },
    ],
    companies: (companyIndex.data ?? []).map((c) => ({ label: c.name, detail: c.detail, to: `/companies/${c.id}` })),
  }

  return (
    <header className="flex w-full flex-col bg-surface">
      <div className="flex h-[60px] items-center gap-[20px] px-[40px]">
        <Link to="/" className="flex shrink-0 items-center gap-[9px]">
          <span className="size-[24px] rounded-[7px] bg-green" />
          <span className="text-h2 font-semibold text-ink">Vested</span>
        </Link>

        <NavSearch />

        <Link
          to="/employer"
          className="flex shrink-0 items-center gap-[6px] rounded-[8px] border border-line px-[12px] py-[8px] text-body font-medium text-mid hover:bg-soft"
        >
          For employers
          <img src={arrowRightIcon} alt="" width={12} height={12} />
        </Link>

        {user ? (
          <>
            <Notifications />
            <AccountMenu user={user} />
          </>
        ) : (
          // Hidden until the session check finishes, so signed-in users don't see a flash of "Log in".
          <div className={`flex shrink-0 items-center gap-[20px] ${ready ? '' : 'invisible'}`}>
            <Link to="/login" className="text-body font-medium text-mid hover:text-ink">
              Log in
            </Link>
            <Button kind="primary" to="/signup">
              Sign up
            </Button>
          </div>
        )}
      </div>

      <nav className="flex h-[44px] items-center gap-[4px] border-b border-line px-[40px]" role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          const items = menus[tab.id]
          return tab.hasMenu && items ? (
            <NavMenu key={tab.id} label={tab.label} active={active} to={tab.to} items={items} />
          ) : (
            <TabItem
              key={tab.id}
              label={tab.label}
              active={active}
              to={tab.to}
              xPadClassName="px-[12px]"
              yPadClassName="pt-[12px] pb-[10px]"
            />
          )
        })}
        <div className="flex-1" />
        <Link
          to="/contribute"
          className="flex shrink-0 items-center gap-[6px] rounded-full bg-green-50 py-[7px] pr-[13px] pl-[11px] text-small font-medium text-t-green"
        >
          <img src={plusCircleIcon} alt="" width={13} height={13} />
          Add your benefits
        </Link>
      </nav>
    </header>
  )
}
