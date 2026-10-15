import type { ReactNode } from 'react'
import { Link } from 'react-router'

type TabTone = 'green' | 'teal'

const activeClasses: Record<TabTone, { text: string; rule: string }> = {
  green: { text: 'text-t-green', rule: 'bg-green' },
  teal: { text: 'text-t-teal', rule: 'bg-teal-900' },
}

type TabItemProps = {
  label: string
  active: boolean
  /** Horizontal padding, e.g. "px-[12px]". The rule spans the label only. */
  xPadClassName: string
  /** Vertical padding of the label row, e.g. "pt-[12px] pb-[10px]". */
  yPadClassName: string
  onClick?: () => void
  /** Renders a router link instead of a button. */
  to?: string
  trailing?: ReactNode
  tone?: TabTone
  /** Text color of inactive tabs. */
  inactiveClassName?: string
}

/** Text tab with an underline rule under the active label. */
export function TabItem({
  label,
  active,
  xPadClassName,
  yPadClassName,
  onClick,
  to,
  trailing,
  tone = 'green',
  inactiveClassName = 'text-mid hover:text-ink',
}: TabItemProps) {
  const content = (
    <>
      <span className={`flex items-center gap-[5px] ${yPadClassName}`}>
        <span className={`text-body ${active ? `font-medium ${activeClasses[tone].text}` : inactiveClassName}`}>
          {label}
        </span>
        {trailing}
      </span>
      <span className={`h-[2.5px] self-stretch ${active ? activeClasses[tone].rule : ''}`} />
    </>
  )
  const className = `flex shrink-0 cursor-pointer flex-col items-stretch ${xPadClassName}`

  if (to) {
    return (
      <Link to={to} role="tab" aria-selected={active} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={className}>
      {content}
    </button>
  )
}
