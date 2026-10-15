import type { Percentile } from '../data/mock'

function barColor(value: number) {
  if (value >= 70) return 'bg-olive'
  if (value >= 60) return 'bg-olive-300'
  return 'bg-olive-100'
}

function ordinal(n: number) {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

const sizes = {
  lg: { area: 'h-[214px] w-[74px] gap-[6px]', col: 'gap-[7px]', bar: 'w-[62px] rounded-[5px]', pxPerPoint: 1.9, pad: 'px-[14px] pt-[10px]' },
  md: { area: 'h-[180px] w-[50px] gap-[5px]', col: 'gap-[6px]', bar: 'w-[40px] rounded-[4px]', pxPerPoint: 1.6, pad: 'px-[6px] pt-[8px]' },
}

type PercentileColumnsProps = {
  items: Percentile[]
  size?: keyof typeof sizes
  /** Show "82nd" instead of "82". */
  showOrdinal?: boolean
}

/** Vertical percentile bars, colored by strength. */
export function PercentileColumns({ items, size = 'lg', showOrdinal = false }: PercentileColumnsProps) {
  const s = sizes[size]
  return (
    <div className={`flex w-full items-start justify-between ${s.pad}`}>
      {items.map((item) => (
        <div key={item.label} className={`flex flex-col items-center ${s.col}`}>
          <div className={`flex flex-col items-center justify-end ${s.area}`}>
            <span className="text-small font-medium text-ink">{showOrdinal ? ordinal(item.value) : item.value}</span>
            <span
              className={`shrink-0 ${s.bar} ${barColor(item.value)}`}
              style={{ height: Math.round(item.value * s.pxPerPoint) }}
            />
          </div>
          <span className="text-small whitespace-nowrap text-mid">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
