import type { CompanyRecord, FactValue } from '../../data/mock'
import { describeMatchRule, matchCapPercent, maxMatchPercent, usd } from '../../lib/benefits'
import type { Fact } from './FactList'

const money = (v: FactValue, suffix = ' / yr'): Pick<Fact, 'value' | 'source'> =>
  v === 'unknown'
    ? { value: 'Not documented', source: 'unknown' }
    : v === 'none'
      ? { value: 'Not offered', source: 'document' }
      : { value: `${usd.format(v)}${suffix}`, source: 'document' }

/** Facts for each profile tab, built from the standardised record. */
export function factsFor(record: CompanyRecord, salary: number) {
  const { facts, flags = {} } = record
  const max = maxMatchPercent(facts.matchTiers)
  return {
    retirement: [
      { label: 'Match rule', value: describeMatchRule(facts.matchTiers), source: 'document' },
      { label: 'Contribute to get the full match', value: `${matchCapPercent(facts.matchTiers)}% of pay`, source: 'document' },
      { label: 'Employer adds at most', value: `${max}% of base · ${usd.format((max / 100) * salary)} at ${usd.format(salary)}`, source: 'document' },
      { label: 'Match vesting', value: facts.vesting, source: 'document' },
      { label: 'Student loan help', ...money(facts.studentLoan), flag: flags.loan },
    ] as Fact[],
    health: [
      { label: 'Premium covered by employer', value: `${facts.healthCoveredPct}%`, source: 'document' },
      { label: 'Employer share, per year', value: usd.format(facts.healthValue), source: 'document' },
      { label: 'HSA employer seed', ...money(facts.hsaSeed), flag: flags.hsa },
      { label: 'Commuter + wellness', value: `${usd.format(facts.everydayValue)} / yr`, source: 'document' },
    ] as Fact[],
    timeOff: [
      {
        label: 'Paid time off',
        value: facts.ptoDays === 'unlimited' ? 'Unlimited' : `${facts.ptoDays} days, accrued monthly`,
        source: facts.ptoDays === 'unlimited' ? 'report' : 'document',
        flag: flags.pto,
      },
      { label: 'Parental leave', value: `${facts.parentalWeeks} weeks, fully paid`, source: 'document' },
      { label: 'Learning budget', ...money(facts.learningBudget), flag: flags.learning },
    ] as Fact[],
  }
}

/** Plain CSV of a company's standard facts, for the Download button. */
export function factsCsv(record: CompanyRecord, salary: number) {
  const groups = factsFor(record, salary)
  const rows = [['Category', 'Benefit', 'Value', 'Source', 'Note']]
  for (const [category, list] of Object.entries(groups)) {
    for (const fact of list) rows.push([category, fact.label, fact.value, fact.source, fact.flag ?? ''])
  }
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
}
