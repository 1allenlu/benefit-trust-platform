export type BarLegendItem = {
  label: string
  value: string
  /** Secondary figure shown after the value, e.g. a dollar amount. */
  detail?: string
  colorClassName: string
}

type BarLegendProps = {
  items: BarLegendItem[]
  /** Height of the color bar, in px. */
  barHeight: number
}

/** Legend with a thin vertical color bar beside each label and value. */
export function BarLegend({ items, barHeight }: BarLegendProps) {
  return (
    <ul className="flex min-w-0 flex-1 flex-col gap-[9px]">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-[8px]">
          <span className={`w-[4px] shrink-0 rounded-[2px] ${item.colorClassName}`} style={{ height: barHeight }} />
          <div className="flex min-w-0 flex-col whitespace-nowrap">
            <span className="text-small text-mid">{item.label}</span>
            <span className="flex items-baseline gap-[6px]">
              <span className="text-body font-medium text-ink">{item.value}</span>
              {item.detail && <span className="text-small text-light">{item.detail}</span>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
