export type BarListRow = {
  label: string
  /** Bar length in px. */
  width: number
  /** Tailwind background class for the bar. */
  colorClassName: string
  valueLabel: string
}

type BarListProps = {
  rows: BarListRow[]
  /** Width of the right-aligned label column, in px. */
  labelWidth: number
}

/** Horizontal bar chart with right-aligned labels and an axis line. */
export function BarList({ rows, labelWidth }: BarListProps) {
  return (
    <ul className="flex w-full flex-col">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center border-b border-line py-[9px] last:border-b-0">
          <span
            className="shrink-0 truncate pr-[12px] text-right text-small font-medium text-mid"
            style={{ width: labelWidth }}
          >
            {row.label}
          </span>
          <span className="h-[26px] w-px shrink-0 bg-line-strong" />
          <span className="flex min-w-0 flex-1 items-center gap-[8px]">
            <span className={`h-[10px] shrink-0 rounded-full ${row.colorClassName}`} style={{ width: row.width }} />
            <span className="text-small font-medium whitespace-nowrap text-ink">{row.valueLabel}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
