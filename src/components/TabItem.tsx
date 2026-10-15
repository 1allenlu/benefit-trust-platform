import type { ReactNode } from 'react'

type TabItemProps = {
  label: string
  active: boolean
  onClick: () => void
  /** Vertical padding of the label row, e.g. "pt-[12px] pb-[10px]". */
  paddingClassName: string
  trailing?: ReactNode
}

/** Text tab with a green underline rule under the active label. */
export function TabItem({ label, active, onClick, paddingClassName, trailing }: TabItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="flex shrink-0 cursor-pointer flex-col items-center"
    >
      <span className={`flex items-center gap-[5px] px-[12px] ${paddingClassName}`}>
        <span className={`text-body ${active ? 'font-medium text-t-green' : 'text-mid hover:text-ink'}`}>{label}</span>
        {trailing}
      </span>
      <span className={`h-[2.5px] self-stretch mx-[12px] ${active ? 'bg-green' : ''}`} />
    </button>
  )
}
