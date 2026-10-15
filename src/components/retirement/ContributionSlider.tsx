type ContributionSliderProps = {
  /** Contribution % of pay. */
  value: number
  onChange: (value: number) => void
  matchCapPercent: number
  maxPercent: number
}

/** Contribution slider: matched range, current contribution, and the match cap marker. */
export function ContributionSlider({ value, onChange, matchCapPercent, maxPercent }: ContributionSliderProps) {
  const pct = (n: number) => `${(n / maxPercent) * 100}%`

  return (
    <div className="group relative h-[28px] w-[850px] shrink-0">
      <span className="absolute top-[9px] left-0 h-[10px] w-full rounded-full bg-shade" />
      <span className="absolute top-[9px] left-0 h-[10px] rounded-full bg-green-50" style={{ width: pct(matchCapPercent) }} />
      <span className="absolute top-[9px] left-0 h-[10px] rounded-full bg-green" style={{ width: pct(value) }} />
      <span className="absolute top-[3px] h-[22px] w-[2px] -translate-x-px bg-teal-900" style={{ left: pct(matchCapPercent) }} />
      <span
        className="pointer-events-none absolute top-[2px] size-[24px] -translate-x-1/2 rounded-full border-4 border-green bg-surface transition-shadow group-has-[:focus-visible]:shadow-[0_0_0_4px_rgba(44,122,75,0.25)]"
        style={{ left: pct(value) }}
      />
      <input
        type="range"
        min={0}
        max={maxPercent}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Your contribution, percent of pay"
        aria-valuetext={`${value}% of pay`}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}
