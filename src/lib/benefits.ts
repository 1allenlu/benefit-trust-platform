import type {
  Company,
  CompanyFacts,
  CompanyRecord,
  CompareCell,
  CompareScope,
  FactKey,
  FactValue,
  MatchTier,
} from '../data/mock'

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const amount = (v: FactValue) => (typeof v === 'number' ? v : 0)

/** Employer match as a % of pay, given what you contribute (% of pay). */
export function employerMatchPercent(tiers: MatchTier[], contributionPercent: number) {
  let matched = 0
  let floor = 0
  for (const tier of tiers) {
    const band = Math.max(0, Math.min(contributionPercent, tier.upTo) - floor)
    matched += band * tier.rate
    floor = tier.upTo
  }
  return matched
}

/** The most the employer will ever add, as a % of pay. */
export function maxMatchPercent(tiers: MatchTier[]) {
  return employerMatchPercent(tiers, tiers.at(-1)?.upTo ?? 0)
}

/** Contribution % needed to collect the full match. */
export function matchCapPercent(tiers: MatchTier[]) {
  return tiers.at(-1)?.upTo ?? 0
}

export function describeMatchRule(tiers: MatchTier[]) {
  let floor = 0
  const parts = tiers.map((tier, i) => {
    const band = tier.upTo - floor
    floor = tier.upTo
    return `${tier.rate * 100}% of ${i === 0 ? 'first' : 'next'} ${band}%`
  })
  return parts.join(', ')
}

const PART_TIME = 0.5

/** Facts adjusted for the employment type in scope. Part-time prorates time off and budgets. */
export function scopedFacts(facts: CompanyFacts, scope: Pick<CompareScope, 'employment'>): CompanyFacts {
  if (scope.employment !== 'Part-time') return facts
  const prorate = (v: FactValue) => (typeof v === 'number' ? Math.round(v * PART_TIME) : v)
  return {
    ...facts,
    learningBudget: prorate(facts.learningBudget),
    everydayValue: Math.round(facts.everydayValue * PART_TIME),
    ptoDays: typeof facts.ptoDays === 'number' ? Math.round(facts.ptoDays * PART_TIME) : facts.ptoDays,
  }
}

export type ValueParts = {
  health: number
  match: number
  /** Commuter, wellness and HSA seed. */
  everyday: number
  learning: number
  loans: number
}

/** Employer-paid dollars per year, by part, at a given base salary (assumes you take the full match). */
export function valueParts(facts: CompanyFacts, baseSalary: number): ValueParts {
  return {
    health: facts.healthValue,
    match: Math.round((maxMatchPercent(facts.matchTiers) / 100) * baseSalary),
    everyday: facts.everydayValue + amount(facts.hsaSeed),
    learning: amount(facts.learningBudget),
    loans: amount(facts.studentLoan),
  }
}

export function totalValue(parts: ValueParts) {
  return parts.health + parts.match + parts.everyday + parts.learning + parts.loans
}

export function summarize(record: CompanyRecord, baseSalary: number): Company {
  const { facts } = record
  return {
    id: record.id,
    name: record.name,
    city: record.city,
    industries: record.industries,
    roles: record.roles,
    reportCount: record.reportCount,
    annualValue: totalValue(valueParts(facts, baseSalary)),
    matchPercent: maxMatchPercent(facts.matchTiers),
    timeOff: facts.ptoDays === 'unlimited' ? 'Unlimited' : `${facts.ptoDays}d PTO`,
  }
}

/* ---------- Compare rows ---------- */

type RowSpec = {
  key: FactKey
  benefit: string
  /** Comparable number, or null when unknown / not offered. Higher is better unless `lowerIsBetter`. */
  score: (facts: CompanyFacts, salary: number) => number | null
  text: (facts: CompanyFacts, salary: number) => string
  lowerIsBetter?: boolean
}

const factText = (v: FactValue, suffix = ' / yr') =>
  v === 'unknown' ? 'Not documented' : v === 'none' ? 'Not offered' : `${usd.format(v)}${suffix}`
const factScore = (v: FactValue) => (typeof v === 'number' ? v : null)

export const compareRows: RowSpec[] = [
  {
    key: 'match',
    benefit: '401(k) match',
    score: (f, salary) => maxMatchPercent(f.matchTiers) * salary,
    text: (f, salary) => {
      const pct = maxMatchPercent(f.matchTiers)
      return `${pct}% of base · ${usd.format((pct / 100) * salary)}`
    },
  },
  { key: 'vesting', benefit: 'Match vesting', score: (f) => f.vestingYears, text: (f) => f.vesting, lowerIsBetter: true },
  {
    key: 'health',
    benefit: 'Health premium covered',
    score: (f) => f.healthCoveredPct,
    text: (f) => `${f.healthCoveredPct}% · ${usd.format(f.healthValue)}`,
  },
  {
    key: 'pto',
    benefit: 'Paid time off',
    score: (f) => (typeof f.ptoDays === 'number' ? f.ptoDays : null),
    text: (f) => (f.ptoDays === 'unlimited' ? '“Unlimited”' : `${f.ptoDays} days accrued`),
  },
  { key: 'parental', benefit: 'Parental leave', score: (f) => f.parentalWeeks, text: (f) => `${f.parentalWeeks} weeks paid` },
  { key: 'learning', benefit: 'Learning budget', score: (f) => factScore(f.learningBudget), text: (f) => factText(f.learningBudget) },
  { key: 'loan', benefit: 'Student loan help', score: (f) => factScore(f.studentLoan), text: (f) => factText(f.studentLoan) },
  { key: 'hsa', benefit: 'HSA employer seed', score: (f) => factScore(f.hsaSeed), text: (f) => factText(f.hsaSeed) },
]

const isMissing = (text: string) => text === 'Not documented' || text === 'Not offered'

/** One row per benefit; green marks the strongest documented value. Unknowns never win or lose. */
export function buildMatrix(records: CompanyRecord[], scope: CompareScope) {
  return compareRows.map((row) => {
    const facts = records.map((r) => scopedFacts(r.facts, scope))
    const scores = facts.map((f) => row.score(f, scope.baseSalary))
    const known = scores.filter((v): v is number => v !== null)
    const best = known.length < 2 || new Set(known).size < 2 ? null : row.lowerIsBetter ? Math.min(...known) : Math.max(...known)
    const cells: CompareCell[] = records.map((record, i) => {
      const text = row.text(facts[i], scope.baseSalary)
      return {
        text,
        best: best !== null && scores[i] === best,
        muted: isMissing(text),
        flag: record.flags?.[row.key],
      }
    })
    return { benefit: row.benefit, cells }
  })
}

/** Facts we can't score, listed instead of being counted as zero. */
export function unknownsFor(records: CompanyRecord[]) {
  const labels: Record<string, string> = { hsaSeed: 'HSA employer seed', studentLoan: 'Student loan help', learningBudget: 'Learning budget' }
  const keyFor: Record<string, FactKey> = { hsaSeed: 'hsa', studentLoan: 'loan', learningBudget: 'learning' }
  const items: { field: string; detail: string }[] = []
  for (const record of records) {
    for (const field of ['hsaSeed', 'studentLoan', 'learningBudget'] as const) {
      if (record.facts[field] === 'unknown') {
        items.push({ field: labels[field], detail: `${record.name} · ${record.flags?.[keyFor[field]] ?? 'Not published'}` })
      }
    }
    if (record.facts.ptoDays === 'unlimited') {
      items.push({ field: 'PTO minimum', detail: `${record.name} · No floor documented` })
    }
  }
  return items
}
