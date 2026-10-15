import matchCurve from '../../assets/charts/match-curve.svg'

const yLabels = [
  { label: '$5,000', top: 16.36 },
  { label: '$2,500', top: 98.18 },
  { label: '$0', top: 180 },
]
const xLabels = [
  { label: '0%', left: 47 },
  { label: '2%', left: 205 },
  { label: '4%', left: 363 },
  { label: '6%', left: 521 },
  { label: '8%', left: 679 },
  { label: '10%', left: 837 },
]

type MatchCurveProps = {
  /** Contribution % highlighted on the x-axis. */
  contributionPercent: number
  matchCapPercent: number
}

/** Employer match by contribution %. The curve itself is the Figma-exported chart. */
export function MatchCurve({ contributionPercent, matchCapPercent }: MatchCurveProps) {
  return (
    <figure className="relative h-[232px] w-[846px] shrink-0">
      <img src={matchCurve} alt="" width={846} height={210} className="absolute top-0 left-0" />
      {yLabels.map((y) => (
        <span key={y.label} className="absolute left-0 text-small whitespace-nowrap text-light" style={{ top: y.top }}>
          {y.label}
        </span>
      ))}
      {xLabels.map((x) => (
        <span
          key={x.label}
          className={`absolute top-[194px] text-small whitespace-nowrap ${
            x.label === `${contributionPercent}%` ? 'text-t-green' : 'text-light'
          }`}
          style={{ left: x.left }}
        >
          {x.label}
        </span>
      ))}
      <span className="absolute top-[210px] left-[383px] flex items-center gap-[5px] rounded-full bg-teal-100 py-[3px] pr-[9px] pl-[8px] text-small font-medium whitespace-nowrap text-t-teal">
        <span className="size-[6px] rounded-full bg-teal-900" />
        Match maxes out at {matchCapPercent}%
      </span>
      <span className="absolute top-[-3.64px] left-[541px] rounded-full bg-green px-[9px] py-[3px] text-small font-medium text-on-dark">
        You
      </span>
    </figure>
  )
}
