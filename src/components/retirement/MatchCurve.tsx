import type { MatchTier } from '../../data/mock'
import { employerMatchPercent, usd } from '../../lib/benefits'

// Chart geometry, taken from the Figma export (846 × 210, 0–10% across, $0–max up).
const X0 = 56
const PX_PER_POINT = 79
const Y_BASE = 188
const Y_TOP = 24.4
const MAX_PERCENT = 10

const xFor = (percent: number) => X0 + percent * PX_PER_POINT

type MatchCurveProps = {
  tiers: MatchTier[]
  baseSalary: number
  contributionPercent: number
  matchCapPercent: number
}

/** Employer match (dollars) against your contribution (% of pay). */
export function MatchCurve({ tiers, baseSalary, contributionPercent, matchCapPercent }: MatchCurveProps) {
  const dollarsAt = (p: number) => (employerMatchPercent(tiers, p) / 100) * baseSalary
  const maxDollars = dollarsAt(MAX_PERCENT) || 1
  const yFor = (dollars: number) => Y_BASE - (dollars / maxDollars) * (Y_BASE - Y_TOP)

  // A point at every tier boundary plus each whole percent traces the curve exactly.
  const xs = [...new Set([...Array.from({ length: MAX_PERCENT + 1 }, (_, i) => i), ...tiers.map((t) => t.upTo)])].sort((a, b) => a - b)
  const line = xs.map((p, i) => `${i ? 'L' : 'M'}${xFor(p)} ${yFor(dollarsAt(p))}`).join(' ')
  const area = `${line} V${Y_BASE} H${X0} Z`

  const capX = xFor(matchCapPercent)
  const youX = xFor(contributionPercent)
  const youY = yFor(dollarsAt(contributionPercent))

  const yLabels = [
    { label: usd.format(maxDollars), top: 16.36 },
    { label: usd.format(maxDollars / 2), top: 98.18 },
    { label: '$0', top: 180 },
  ]

  return (
    <figure className="relative h-[232px] w-[846px] shrink-0" aria-label={`Employer match at ${contributionPercent}%: ${usd.format(dollarsAt(contributionPercent))}`}>
      <svg width={846} height={210} viewBox="0 0 846 210" className="absolute top-0 left-0 overflow-visible">
        {[Y_BASE, (Y_BASE + Y_TOP) / 2, Y_TOP].map((y) => (
          <path key={y} d={`M${X0} ${y}H846`} className="stroke-shade" />
        ))}
        <path d={area} className="fill-green" fillOpacity={0.09} />
        <path d={line} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="stroke-green" />
        <path d={`M${capX} ${yFor(dollarsAt(matchCapPercent))}V${Y_BASE}`} strokeWidth={2} strokeDasharray="5 4" className="stroke-teal-900" />
        <circle cx={capX} cy={yFor(dollarsAt(matchCapPercent))} r={5} strokeWidth={3} className="fill-surface stroke-teal-900" />
        <path d={`M${youX} ${youY}V${Y_BASE}`} strokeWidth={2} strokeDasharray="5 4" className="stroke-green transition-all" />
        <circle cx={youX} cy={youY} r={7} strokeWidth={4} className="fill-surface stroke-green transition-all" />
      </svg>
      {yLabels.map((y) => (
        <span key={y.top} className="absolute left-0 text-small whitespace-nowrap text-light" style={{ top: y.top }}>
          {y.label}
        </span>
      ))}
      {Array.from({ length: MAX_PERCENT / 2 + 1 }, (_, i) => i * 2).map((p) => (
        <span
          key={p}
          className={`absolute top-[194px] -translate-x-1/2 text-small whitespace-nowrap ${p === contributionPercent ? 'text-t-green' : 'text-light'}`}
          style={{ left: xFor(p) }}
        >
          {p}%
        </span>
      ))}
      <span
        className="absolute top-[210px] flex -translate-x-1/2 items-center gap-[5px] rounded-full bg-teal-100 py-[3px] pr-[9px] pl-[8px] text-small font-medium whitespace-nowrap text-t-teal"
        style={{ left: capX }}
      >
        <span className="size-[6px] rounded-full bg-teal-900" />
        Match maxes out at {matchCapPercent}%
      </span>
      <span
        className="absolute rounded-full bg-green px-[9px] py-[3px] text-small font-medium text-on-dark transition-all"
        style={{ left: youX + 11, top: youY - 28 }}
      >
        You
      </span>
    </figure>
  )
}
