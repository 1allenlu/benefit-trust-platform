import type { Stat, StatTone } from '../data/mock'

const toneClasses: Record<StatTone, { box: string; value: string }> = {
  default: { box: 'bg-soft', value: 'text-ink' },
  highlight: { box: 'border border-green bg-green-50', value: 'text-t-green' },
  flag: { box: 'bg-amber-50', value: 'text-t-amber' },
}

export function StatTile({ label, value, sub, tone = 'default' }: Stat) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-[4px] rounded-[8px] px-[16px] pt-[14px] pb-[15px] whitespace-nowrap ${toneClasses[tone].box}`}
    >
      <p className="text-small text-mid">{label}</p>
      <p className={`text-num font-bold ${toneClasses[tone].value}`}>{value}</p>
      <p className="truncate text-small text-light">{sub}</p>
    </div>
  )
}

export function StatTileRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex w-full items-start gap-[14px]">
      {stats.map((stat) => (
        <StatTile key={stat.label} {...stat} />
      ))}
    </div>
  )
}
