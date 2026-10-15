export type DonutSegment = {
  value: number
  /** Tailwind stroke class, e.g. "stroke-teal-900". */
  colorClassName: string
  label?: string
}

type DonutChartProps = {
  segments: DonutSegment[]
  size: number
  thickness: number
  /** Gap between segments, in degrees. */
  gapDegrees?: number
  label?: string
}

/** Ring chart drawn clockwise from 12 o'clock, matching the Figma donuts. */
export function DonutChart({ segments, size, thickness, gapDegrees = 1.6, label }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const r = (size - thickness) / 2
  const c = size / 2
  const visible = segments.filter((s) => s.value > 0)
  const gap = visible.length > 1 ? gapDegrees : 0
  const arcs = visible.map((segment, i) => {
    const before = visible.slice(0, i).reduce((sum, s) => sum + s.value, 0)
    const start = (before / total) * 360
    const sweep = (segment.value / total) * 360
    return { segment, from: start + gap / 2, to: start + sweep - gap / 2, full: sweep >= 359.99 }
  })

  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return `${c + r * Math.cos(rad)} ${c + r * Math.sin(rad)}`
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="shrink-0">
      {arcs.map(({ segment, from, to, full }) =>
        full ? (
          <circle key={segment.colorClassName} cx={c} cy={c} r={r} fill="none" strokeWidth={thickness} className={segment.colorClassName} />
        ) : (
          <path
            key={segment.label ?? segment.colorClassName}
            d={`M ${point(from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`}
            fill="none"
            strokeWidth={thickness}
            className={segment.colorClassName}
          >
            {segment.label && <title>{segment.label}</title>}
          </path>
        ),
      )}
    </svg>
  )
}
