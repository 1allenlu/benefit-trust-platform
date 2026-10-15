/** Progress ring for profile completeness, matching the Figma 54px ring. */
export function CompletenessRing({ ratio }: { ratio: number }) {
  const size = 54
  const stroke = 7
  const r = 22
  const circumference = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" role="img" aria-label={`${Math.round(ratio * 100)}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        className="stroke-teal-900 transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  )
}
