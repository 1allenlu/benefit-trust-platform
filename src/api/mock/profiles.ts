import { companyProfiles, companyRecords, defaultBaseSalary, type CompanyProfile, type CompanyRecord, type CoverageLevel, type Percentile } from '../../data/mock'
import { maxMatchPercent, totalValue, usd, valueParts } from '../../lib/benefits'

const pct = (part: number, whole: number) => `${((part / whole) * 100).toFixed(1)}%`

/** Rank among all companies as a 0–100 percentile (ties share a rank). */
function percentile(value: number, all: number[]) {
  const below = all.filter((v) => v < value).length
  const equal = all.filter((v) => v === value).length
  return Math.round(((below + equal / 2) / all.length) * 100)
}

const level = (score: number): CoverageLevel => (score >= 100 ? 'Full' : score >= 70 ? 'Partial' : 'Limited')
const num = (v: number | string) => (typeof v === 'number' ? v : 0)

const questionTemplates = [
  'Vesting schedule',
  'How the match tiers work',
  'PTO carryover deadline',
  'HSA employer seed',
  'Parental leave eligibility',
  'Learning approval process',
  'Commuter pre-tax limits',
  'Student loan qualification',
]
const questionShares = [34.2, 24.8, 16.1, 10.3, 5.6, 4.1, 3.2, 1.7]

/**
 * Builds the standard profile for any company from its facts. Northstar keeps its
 * hand-written profile from the design; everyone else is described with the same fields.
 */
export function buildProfile(record: CompanyRecord): CompanyProfile {
  const handWritten = companyProfiles[record.id]
  if (handWritten) return handWritten

  const { facts } = record
  const parts = valueParts(facts, defaultBaseSalary)
  const total = totalValue(parts)
  const match = maxMatchPercent(facts.matchTiers)
  const shortName = record.name.split(' ')[0]
  const pto = typeof facts.ptoDays === 'number' ? facts.ptoDays : null

  const categories: { label: string; value: (r: CompanyRecord) => number }[] = [
    { label: '401(k) match', value: (r) => maxMatchPercent(r.facts.matchTiers) },
    { label: 'Parental leave', value: (r) => r.facts.parentalWeeks },
    { label: 'Health', value: (r) => r.facts.healthCoveredPct },
    { label: 'Everyday', value: (r) => r.facts.everydayValue },
    { label: 'Time off', value: (r) => num(r.facts.ptoDays) },
    { label: 'Learning', value: (r) => num(r.facts.learningBudget) },
  ]
  const percentiles: Percentile[] = categories.map((c) => ({
    label: c.label,
    value: percentile(c.value(record), companyRecords.map(c.value)),
  }))
  const ranked = [...percentiles].sort((a, b) => b.value - a.value)
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

  const coverage: CompanyProfile['coverage'] = [
    { label: 'Health & insurance', score: facts.healthCoveredPct >= 85 ? 100 : facts.healthCoveredPct >= 70 ? 85 : 40 },
    { label: 'Retirement', score: match >= 4 ? 100 : match >= 3 ? 85 : 40 },
    { label: 'Time off & leave', score: pto !== null && pto >= 20 ? 100 : pto === null ? 70 : 85 },
    { label: 'Family & caregiving', score: facts.parentalWeeks >= 16 ? 100 : facts.parentalWeeks >= 10 ? 85 : 40 },
    { label: 'Learning & career', score: num(facts.learningBudget) >= 2000 ? 100 : num(facts.learningBudget) >= 1000 ? 70 : 40 },
    { label: 'Everyday benefits', score: facts.everydayValue >= 2000 ? 100 : facts.everydayValue >= 1000 ? 70 : 40 },
    { label: 'Equity & ownership', score: 40 },
    { label: 'Student loan support', score: num(facts.studentLoan) > 0 ? 100 : 40 },
  ].map((row) => ({ ...row, level: level(row.score) }))

  const offset = record.reportCount % questionTemplates.length
  const topics = questionTemplates.map((label, i) => ({
    label,
    share: questionShares[(i + offset) % questionShares.length],
  }))
  topics.sort((a, b) => b.share - a.share)
  const docs = record.sources.documents

  return {
    id: record.id,
    name: record.name,
    employerVerified: record.verified,
    meta: [`${record.industries[0]} · ${record.employees} employees`, record.city, 'Plan year 2026', `Last verified ${record.lastVerified}`],
    subTabs: ['Overview', '401(k) & retirement', 'Health', 'Time off', `Community (${record.reportCount})`],
    stats: [
      { label: 'Employer-paid benefits', value: usd.format(total), sub: 'per year, excluding pay' },
      { label: '401(k) match', value: `${match.toFixed(1)}%`, sub: `of base, max ${usd.format(parts.match)}` },
      {
        label: 'Paid time off',
        value: pto === null ? 'Unlimited' : `${pto} days`,
        sub: pto === null ? 'no documented minimum' : 'accrued monthly',
      },
      { label: 'Parental leave', value: `${facts.parentalWeeks} weeks`, sub: 'fully paid' },
      {
        label: 'Evidence confidence',
        value: docs >= 75 ? 'High' : 'Medium',
        sub: `${docs}% traced to documents`,
        tone: docs >= 75 ? 'highlight' : 'default',
      },
    ],
    valueBreakdown: {
      total: usd.format(total),
      items: [
        { label: 'Health premium', value: parts.health },
        { label: '401(k) match', value: parts.match },
        { label: 'Commuter + wellness', value: parts.everyday },
        { label: 'Learning budget', value: parts.learning },
        { label: 'Student loan help', value: parts.loans },
      ]
        .filter((item) => item.value > 0)
        .map((item) => ({ label: item.label, share: pct(item.value, total), amount: usd.format(item.value) })),
    },
    coverage,
    sources: [
      { label: 'Plan documents', share: `${record.sources.documents}%` },
      { label: 'Employee reports', share: `${record.sources.reports}%` },
      { label: 'Not documented', share: `${record.sources.undocumented}%` },
    ],
    peers: {
      title: `How ${shortName} compares`,
      subtitle: `Percentile against ${companyRecords.length - 1} peer employers`,
      scopes: [`${record.industries[0]} peers`, 'All employers'],
      percentiles,
      note: `Strongest on ${lower(ranked[0].label)} and ${lower(ranked[1].label)}. ${ranked.at(-1)!.label} sits lowest.`,
      scopeNote: `Scoped: ${record.city} · full-time · 2026`,
    },
    questions: {
      subtitle: `Share of ${record.reportCount * 6} questions on this company`,
      topics,
      gapNote: `${topics[0].label} and ${lower(topics[1].label)} are ${(topics[0].share + topics[1].share).toFixed(0)}% of every question asked here.`,
      gapStatus: `${shortName} has been notified`,
    },
  }
}
