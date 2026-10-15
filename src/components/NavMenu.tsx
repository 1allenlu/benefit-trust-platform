import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import chevronDownActiveIcon from '../assets/icons/chevron-down-active.svg'
import chevronDownIcon from '../assets/icons/chevron-down.svg'
import { TabItem } from './TabItem'

type NavMenuProps = {
  label: string
  active: boolean
  to: string
  items: { label: string; detail?: string; to: string }[]
}

/** Nav tab with a dropdown that opens on hover or keyboard focus. Clicking the tab navigates. */
export function NavMenu({ label, active, to, items }: NavMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <TabItem
        label={label}
        active={active}
        to={to}
        xPadClassName="px-[12px]"
        yPadClassName="pt-[12px] pb-[10px]"
        trailing={<img src={active ? chevronDownActiveIcon : chevronDownIcon} alt="" width={12} height={12} />}
      />
      {open && (
        <div className="absolute top-full left-0 z-20 pt-[4px]">
          <ul role="menu" className="flex w-[240px] flex-col rounded-[10px] border border-line bg-surface p-[6px] shadow-[0_8px_24px_rgba(14,26,23,0.08)]">
            {items.map((item) => (
              <li key={item.to} role="none">
                <Link
                  role="menuitem"
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-[8px] rounded-[6px] px-[10px] py-[8px] hover:bg-soft"
                >
                  <span className="text-body text-ink">{item.label}</span>
                  {item.detail && <span className="text-small text-light">{item.detail}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
