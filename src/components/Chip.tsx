export type ChipTone = 'default' | 'active' | 'verified' | 'flag' | 'teal'

const toneClasses: Record<ChipTone, string> = {
  default: 'bg-soft text-mid',
  active: 'border border-green bg-green text-on-dark',
  verified: 'border border-green bg-green-50 text-t-green',
  flag: 'border border-amber bg-amber-50 text-t-amber',
  teal: 'bg-teal-100 text-t-teal',
}

type ChipProps = {
  label: string
  tone?: ChipTone
  onClick?: () => void
}

export function Chip({ label, tone = 'default', onClick }: ChipProps) {
  const className = `inline-flex shrink-0 items-center rounded-full px-[10px] py-[4px] text-small font-medium whitespace-nowrap ${toneClasses[tone]}`

  if (onClick) {
    return (
      <button type="button" className={`${className} cursor-pointer`} aria-pressed={tone === 'active'} onClick={onClick}>
        {label}
      </button>
    )
  }
  return <span className={className}>{label}</span>
}
