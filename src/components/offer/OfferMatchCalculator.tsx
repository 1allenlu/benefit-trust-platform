import { useState } from 'react'
import { offerMatchTiers, sampleOffer } from '../../data/offer'
import { employerMatchPercent, matchCapPercent, maxMatchPercent, usd } from '../../lib/benefits'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import { ContributionSlider } from '../retirement/ContributionSlider'
import { MatchCurve } from '../retirement/MatchCurve'
import { SourceLink } from './OfferParts'

/** What the offer's verified match rule pays at a given contribution. Gross dollars only, no projections. */
export function OfferMatchCalculator() {
  const [salary, setSalary] = useState(sampleOffer.baseSalary)
  const cap = matchCapPercent(offerMatchTiers)
  const [contribution, setContribution] = useState(cap)

  const dollars = (percent: number) => (percent / 100) * salary
  const yours = dollars(contribution)
  const theirs = dollars(employerMatchPercent(offerMatchTiers, contribution))
  const missed = dollars(maxMatchPercent(offerMatchTiers)) - theirs

  return (
    <Panel className="w-full gap-[16px]">
      <SectionHeader
        title="What the 401(k) match is worth"
        subtitle="A scenario from the offer's match rule. Nothing is submitted anywhere."
        action={<SourceLink sectionId="employer-match" />}
      />
      <div className="flex items-end gap-[24px]">
        <label className="flex flex-col gap-[5px] text-small font-medium text-mid">
          Base salary from your offer
          <input
            type="number"
            min={0}
            step={1000}
            value={salary}
            onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
            className="w-[160px] rounded-[8px] border border-line-strong bg-surface px-[12px] py-[9px] text-body text-ink outline-none focus:border-green"
          />
        </label>
        <dl className="flex gap-[28px]" aria-live="polite">
          {[
            ['You put in', `${usd.format(yours)} (${contribution}%)`],
            [`${sampleOffer.employer} adds`, usd.format(theirs)],
            ['Match left unclaimed', missed > 0 ? usd.format(missed) : 'nothing'],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-[2px]">
              <dt className="text-cap font-semibold text-light uppercase">{label}</dt>
              <dd className="text-num-m font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ContributionSlider value={contribution} onChange={setContribution} matchCapPercent={cap} maxPercent={10} />
      <MatchCurve tiers={offerMatchTiers} baseSalary={salary} contributionPercent={contribution} matchCapPercent={cap} />
      <p className="text-small text-light">
        Gross yearly amounts. No taxes, investment growth or IRS limits. Vesting isn't in the offer packet, so ask HR before counting the match as yours.
      </p>
    </Panel>
  )
}
