type ContributionSliderProps = {
  /** Contribution % of pay. */
  value: number
  matchCapPercent: number
  maxPercent: number
}

/** Read-only scenario slider: matched range, current contribution, and the match cap marker. */
export function ContributionSlider({ value, matchCapPercent, maxPercent }: ContributionSliderProps) {
  const pct = (n: number) => `${(n / maxPercent) * 100}%`

  return (
    <div
      className="relative h-[28px] w-[850px] shrink-0"
      role="meter"
      aria-label="Your contribution"
      aria-valuemin={0}
      aria-valuemax={maxPercent}
      aria-valuenow={value}
    >
      <span className="absolute top-[9px] left-0 h-[10px] w-full rounded-full bg-shade" />
      <span className="absolute top-[9px] left-0 h-[10px] rounded-full bg-green-50" style={{ width: pct(matchCapPercent) }} />
      <span className="absolute top-[9px] left-0 h-[10px] rounded-full bg-green" style={{ width: pct(value) }} />
      <span className="absolute top-[3px] h-[22px] w-[2px] -translate-x-px bg-teal-900" style={{ left: pct(matchCapPercent) }} />
      <span
        className="absolute top-[2px] size-[24px] -translate-x-1/2 rounded-full border-4 border-green bg-surface"
        style={{ left: pct(value) }}
      />
    </div>
  )
}
