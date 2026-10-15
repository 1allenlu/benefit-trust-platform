import arrowRightIcon from '../assets/icons/arrow-right.svg'
import chevronDownActiveIcon from '../assets/icons/chevron-down-active.svg'
import chevronDownIcon from '../assets/icons/chevron-down.svg'
import plusCircleIcon from '../assets/icons/plus-circle.svg'
import searchIcon from '../assets/icons/search-sm.svg'
import type { NavTab } from '../data/mock'
import { Button } from './Button'
import { TabItem } from './TabItem'

type TopNavProps = {
  tabs: NavTab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function TopNav({ tabs, activeTab, onTabChange }: TopNavProps) {
  return (
    <header className="flex w-full flex-col bg-surface">
      <div className="flex h-[60px] items-center gap-[20px] px-[40px]">
        <a href="/" className="flex shrink-0 items-center gap-[9px]">
          <span className="size-[24px] rounded-[7px] bg-green" />
          <span className="text-[18px] leading-[25px] font-semibold tracking-[-0.2px] text-ink">Vested</span>
        </a>

        <label className="flex min-w-0 flex-1 items-center gap-[9px] rounded-[8px] border border-line bg-soft py-[9px] pr-[12px] pl-[14px]">
          <img src={searchIcon} alt="" width={15} height={15} className="shrink-0" />
          <input
            type="search"
            placeholder="Search a company, benefit, or city"
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-light"
          />
          <kbd className="shrink-0 rounded-[4px] border border-line bg-surface px-[6px] py-[2px] font-sans text-small font-medium text-light">
            ⌘K
          </kbd>
        </label>

        <a
          href="#employers"
          className="flex shrink-0 items-center gap-[6px] rounded-[8px] border border-line px-[12px] py-[8px] text-body font-medium text-mid hover:bg-soft"
        >
          For employers
          <img src={arrowRightIcon} alt="" width={12} height={12} />
        </a>
        <a href="#login" className="shrink-0 text-body font-medium text-mid hover:text-ink">
          Log in
        </a>
        <Button kind="primary">Sign up</Button>
      </div>

      <nav className="flex h-[44px] items-center gap-[4px] border-b border-line px-[40px]" role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <TabItem
              key={tab.id}
              label={tab.label}
              active={active}
              onClick={() => onTabChange(tab.id)}
              paddingClassName="pt-[12px] pb-[10px]"
              trailing={
                tab.hasMenu && (
                  <img src={active ? chevronDownActiveIcon : chevronDownIcon} alt="" width={12} height={12} />
                )
              }
            />
          )
        })}
        <div className="flex-1" />
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-[6px] rounded-full bg-green-50 py-[7px] pr-[13px] pl-[11px] text-small font-medium text-t-green"
        >
          <img src={plusCircleIcon} alt="" width={13} height={13} />
          Add your benefits
        </button>
      </nav>
    </header>
  )
}
