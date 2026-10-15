// Hardcoded mock data. Pages never import this directly: they go through src/api,
// which serves it until VITE_API_URL points at a real backend.

export type NavTab = {
  id: string
  label: string
  to: string
  hasMenu?: boolean
}

export type User = {
  id: string
  firstName: string
  /** e.g. "Maya R." */
  shortName: string
  email: string
}

export type HeroStat = {
  value: string
  label: string
}

export type Company = {
  id: string
  name: string
  /** Employer-paid benefits value per year, in USD. */
  annualValue: number
  matchPercent: number
  /** e.g. "20d PTO" or "Unlimited" */
  timeOff: string
  reportCount: number
  city: string
  industries: string[]
  /** Roles with benefits reports at this company. */
  roles: string[]
  /** Set by benefit searches, e.g. "16 weeks paid leave". Replaces the card's meta line. */
  highlight?: string
}

export type CompanySort = 'value-desc' | 'value-asc' | 'match-desc' | 'reports-desc'

/** A documented amount, or why there isn't one. Unknown is never scored as zero. */
export type FactValue = number | 'unknown' | 'none'

export type MatchTier = {
  /** Applies to your contribution up to this % of pay. */
  upTo: number
  /** Employer dollars per dollar you put in. */
  rate: number
}

/** The standardised facts every company is described with. */
export type CompanyFacts = {
  healthCoveredPct: number
  /** Employer share of the health premium, USD / yr. */
  healthValue: number
  matchTiers: MatchTier[]
  vesting: string
  vestingYears: number
  /** Commuter + wellness, USD / yr. */
  everydayValue: number
  hsaSeed: FactValue
  learningBudget: FactValue
  studentLoan: FactValue
  ptoDays: number | 'unlimited'
  parentalWeeks: number
}

export type FactKey = 'match' | 'vesting' | 'health' | 'pto' | 'parental' | 'learning' | 'loan' | 'hsa'

export type CompanyRecord = Omit<Company, 'annualValue' | 'matchPercent' | 'timeOff'> & {
  employees: string
  verified: boolean
  lastVerified: string
  facts: CompanyFacts
  /** Caveats shown next to a fact, e.g. "No documented minimum". */
  flags?: Partial<Record<FactKey, string>>
  /** Share of published fields by source, in percent. */
  sources: { documents: number; reports: number; undocumented: number }
  /** Fit against the signed-in user's saved priorities. */
  fit: { score: number; note: string }
}

export type RankingMetric = {
  id: '401k' | 'health' | 'time-off' | 'parental'
  label: string
  title: string
  subtitle: string
  /** Formats a value for the bar label, e.g. "6.0%". */
  unit: 'percent' | 'days' | 'weeks'
}

export type RankingRow = {
  label: string
  value: number
  isBenchmark?: boolean
}

export type CommunityTone = 'verified' | 'teal' | 'default' | 'flag'

export type CommunityItem = {
  id: string
  tag: string
  tone: CommunityTone
  title: string
  meta: string
}

export const navTabs: NavTab[] = [
  { id: 'explore', label: 'Explore', to: '/', hasMenu: true },
  { id: 'companies', label: 'Companies', to: '/companies/northstar', hasMenu: true },
  { id: 'compare', label: 'Compare', to: '/compare' },
  { id: 'community', label: 'Community', to: '/community' },
  { id: 'my-benefits', label: 'My benefits', to: '/my-benefits' },
]


export const heroStats: HeroStat[] = [
  { value: '12,408', label: 'benefit reports' },
  { value: '2,140', label: 'companies' },
  { value: '94%', label: 'traced to a plan document' },
]

export const industries: string[] = [
  'Tech',
  'Healthcare',
  'Finance',
  'Biotech',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Public sector',
]

export const moreIndustries: string[] = ['Education', 'Energy', 'Media', 'Nonprofit']

export const roles: string[] = [
  'Product Manager',
  'Software Engineer',
  'Data Scientist',
  'Designer',
  'Analyst',
  'Marketing',
]

export const moreRoles: string[] = ['Sales', 'Operations', 'People / HR', 'Customer Success']

const tiers = (...pairs: [number, number][]): MatchTier[] => pairs.map(([upTo, rate]) => ({ upTo, rate }))

export const companyRecords: CompanyRecord[] = [
  {
    id: 'northstar', name: 'Northstar Labs', reportCount: 46, city: 'New York, NY', industries: ['Tech'],
    roles: ['Product Manager', 'Software Engineer', 'Data Scientist', 'Designer'],
    employees: '1,200', verified: true, lastVerified: '3 Feb 2026',
    facts: {
      healthCoveredPct: 80, healthValue: 9600, matchTiers: tiers([3, 1], [5, 0.5]), vesting: '3-year graded', vestingYears: 3,
      everydayValue: 2600, hsaSeed: 'unknown', learningBudget: 2000, studentLoan: 1200, ptoDays: 20, parentalWeeks: 12,
    },
    flags: { hsa: 'Requested 2 Feb' },
    sources: { documents: 78, reports: 16, undocumented: 6 },
    fit: { score: 81, note: 'Only one with student loan help' },
  },
  {
    id: 'harbor', name: 'Harbor Systems', reportCount: 31, city: 'San Francisco, CA', industries: ['Tech'],
    roles: ['Product Manager', 'Software Engineer', 'Marketing'],
    employees: '640', verified: false, lastVerified: '19 Dec 2025',
    facts: {
      healthCoveredPct: 70, healthValue: 7200, matchTiers: tiers([3, 1]), vesting: 'Immediate', vestingYears: 0,
      everydayValue: 1350, hsaSeed: 750, learningBudget: 3200, studentLoan: 'none', ptoDays: 'unlimited', parentalWeeks: 8,
    },
    flags: { pto: 'No documented minimum' },
    sources: { documents: 61, reports: 29, undocumented: 10 },
    fit: { score: 52, note: 'Unlimited PTO has no documented floor' },
  },
  {
    id: 'meridian', name: 'Meridian Health', reportCount: 88, city: 'Boston, MA', industries: ['Tech', 'Healthcare'],
    roles: ['Product Manager', 'Data Scientist', 'Analyst'],
    employees: '8,400', verified: true, lastVerified: '28 Jan 2026',
    facts: {
      healthCoveredPct: 90, healthValue: 11200, matchTiers: tiers([6, 1]), vesting: '5-year graded', vestingYears: 5,
      everydayValue: 900, hsaSeed: 1500, learningBudget: 1800, studentLoan: 1000, ptoDays: 25, parentalWeeks: 16,
    },
    sources: { documents: 82, reports: 14, undocumented: 4 },
    fit: { score: 74, note: 'Best savings, smaller loan support' },
  },
  {
    id: 'cobalt', name: 'Cobalt Finance', reportCount: 124, city: 'New York, NY', industries: ['Tech', 'Finance'],
    roles: ['Product Manager', 'Software Engineer', 'Analyst'],
    employees: '3,100', verified: true, lastVerified: '30 Jan 2026',
    facts: {
      healthCoveredPct: 85, healthValue: 9000, matchTiers: tiers([5, 1]), vesting: '4-year graded', vestingYears: 4,
      everydayValue: 1200, hsaSeed: 750, learningBudget: 1500, studentLoan: 'unknown', ptoDays: 18, parentalWeeks: 14,
    },
    flags: { loan: 'Asked 12 Jan' },
    sources: { documents: 74, reports: 20, undocumented: 6 },
    fit: { score: 69, note: 'Strong match, loan help not documented' },
  },
  {
    id: 'polaris', name: 'Polaris Retail', reportCount: 57, city: 'Seattle, WA', industries: ['Tech', 'Retail'],
    roles: ['Product Manager', 'Designer', 'Marketing'],
    employees: '12,000', verified: false, lastVerified: '14 Nov 2025',
    facts: {
      healthCoveredPct: 60, healthValue: 5400, matchTiers: tiers([4, 0.5]), vesting: '6-year graded', vestingYears: 6,
      everydayValue: 600, hsaSeed: 400, learningBudget: 500, studentLoan: 'none', ptoDays: 15, parentalWeeks: 6,
    },
    flags: { pto: 'Offer letter says 18 — in review' },
    sources: { documents: 55, reports: 35, undocumented: 10 },
    fit: { score: 38, note: 'Lowest match and shortest leave' },
  },
  {
    id: 'vertex', name: 'Vertex Logistics', reportCount: 22, city: 'Chicago, IL', industries: ['Manufacturing'],
    roles: ['Analyst', 'Software Engineer'],
    employees: '2,300', verified: false, lastVerified: '22 Jan 2026',
    facts: {
      healthCoveredPct: 75, healthValue: 7800, matchTiers: tiers([3, 1], [4, 0.5]), vesting: '3-year cliff', vestingYears: 3,
      everydayValue: 1125, hsaSeed: 500, learningBudget: 1000, studentLoan: 'none', ptoDays: 15, parentalWeeks: 8,
    },
    sources: { documents: 66, reports: 24, undocumented: 10 },
    fit: { score: 55, note: 'Solid health cover, modest time off' },
  },
  {
    id: 'lumen', name: 'Lumen Biotech', reportCount: 19, city: 'Boston, MA', industries: ['Biotech', 'Healthcare'],
    roles: ['Data Scientist', 'Analyst'],
    employees: '900', verified: true, lastVerified: '1 Feb 2026',
    facts: {
      healthCoveredPct: 95, healthValue: 12000, matchTiers: tiers([5, 1]), vesting: 'Immediate', vestingYears: 0,
      everydayValue: 2000, hsaSeed: 1350, learningBudget: 3000, studentLoan: 1500, ptoDays: 22, parentalWeeks: 20,
    },
    sources: { documents: 88, reports: 9, undocumented: 3 },
    fit: { score: 90, note: 'Strong on every priority you saved' },
  },
  {
    id: 'summit', name: 'Summit Advisory', reportCount: 35, city: 'New York, NY', industries: ['Consulting'],
    roles: ['Analyst', 'Product Manager', 'Marketing'],
    employees: '1,700', verified: false, lastVerified: '9 Jan 2026',
    facts: {
      healthCoveredPct: 80, healthValue: 8500, matchTiers: tiers([4, 1]), vesting: '3-year graded', vestingYears: 3,
      everydayValue: 1300, hsaSeed: 'unknown', learningBudget: 2500, studentLoan: 'unknown', ptoDays: 20, parentalWeeks: 12,
    },
    sources: { documents: 70, reports: 18, undocumented: 12 },
    fit: { score: 63, note: 'Good learning budget, loan help unknown' },
  },
]

/** The signed-in user's employer (and the offer they're weighing on Compare). */
export const yourCompanyId = 'northstar'

/** Salary that published dollar figures assume. */
export const defaultBaseSalary = 125000

export const companySortOptions: { value: CompanySort; label: string }[] = [
  { value: 'value-desc', label: 'Highest value' },
  { value: 'value-asc', label: 'Lowest value' },
  { value: 'match-desc', label: 'Highest 401(k) match' },
  { value: 'reports-desc', label: 'Most reports' },
]

/** Explore opens filtered like the design: Tech + Product Manager. */
export const defaultExploreFilters = { industry: 'Tech', role: 'Product Manager' }

/** Mock accounts for the auth endpoints. Passwords are only ever compared in the mock server. */
export const mockAccounts: { user: User; password: string }[] = [
  {
    user: { id: 'u-maya', firstName: 'Maya', shortName: 'Maya R.', email: 'maya@example.com' },
    password: 'vested-demo',
  },
]

export const rankingMetrics: RankingMetric[] = [
  {
    id: '401k', label: '401(k) match', unit: 'percent',
    title: 'Who matches the most', subtitle: 'Employer 401(k) contribution as a share of base salary',
  },
  {
    id: 'health', label: 'Health coverage', unit: 'percent',
    title: 'Who covers the most', subtitle: 'Share of the health premium the employer pays',
  },
  {
    id: 'time-off', label: 'Time off', unit: 'days',
    title: 'Who gives the most time off', subtitle: 'Paid days off per year · unlimited policies with no documented minimum are left out',
  },
  {
    id: 'parental', label: 'Parental leave', unit: 'weeks',
    title: 'Who offers the most leave', subtitle: 'Fully paid parental leave, in weeks',
  },
]

/** Companies shown in "Who matches the most", and the industry medians it compares them with. */
export const rankingCompanyIds = ['meridian', 'cobalt', 'northstar', 'vertex', 'harbor', 'polaris']
export const industryMedians: Record<string, number> = { '401k': 3.2, health: 75, 'time-off': 18, parental: 10 }

export const communityItems: CommunityItem[] = [
  {
    id: 'c1',
    tag: 'Answered',
    tone: 'verified',
    title: 'Does the 401(k) match vest immediately at Harbor?',
    meta: 'Answered by Harbor Systems · People Ops · 2h ago',
  },
  {
    id: 'c2',
    tag: 'New report',
    tone: 'teal',
    title: 'Meridian Health · 6% match confirmed from 2026 plan doc',
    meta: 'Verified against uploaded document · 4h ago',
  },
  {
    id: 'c3',
    tag: 'Open',
    tone: 'default',
    title: "Anyone used Cobalt's fertility benefit after the 2025 change?",
    meta: '3 replies · 7h ago',
  },
  {
    id: 'c4',
    tag: 'Correction',
    tone: 'flag',
    title: 'Polaris PTO listed as 15 days, offer letter says 18',
    meta: 'Under review by Polaris · 11h ago',
  },
]

/* ---------- Shared shapes ---------- */

export type StatTone = 'default' | 'highlight' | 'flag'

export type Stat = {
  label: string
  value: string
  sub: string
  tone?: StatTone
}

export type Percentile = {
  label: string
  /** 0–100 */
  value: number
}

export type ChipToneName = 'default' | 'verified' | 'flag' | 'teal' | 'muted'

/* ---------- 02 · Company benefits profile ---------- */

export type CoverageLevel = 'Full' | 'Partial' | 'Limited'

export type CompanyProfile = {
  id: string
  name: string
  employerVerified: boolean
  meta: string[]
  subTabs: string[]
  stats: Stat[]
  valueBreakdown: { total: string; items: { label: string; share: string; amount: string }[] }
  coverage: { label: string; level: CoverageLevel; /** 0–100 */ score: number }[]
  sources: { label: string; share: string }[]
  peers: { title: string; subtitle: string; scopes: string[]; percentiles: Percentile[]; note: string; scopeNote: string }
  questions: { subtitle: string; topics: { label: string; /** percent */ share: number }[]; gapNote: string; gapStatus: string }
}

export const companyProfiles: Record<string, CompanyProfile> = {
  northstar: {
    id: 'northstar',
    name: 'Northstar Labs',
    employerVerified: true,
    meta: ['Technology · 1,200 employees', 'New York, NY', 'Plan year 2026', 'Last verified 3 Feb 2026'],
    subTabs: ['Overview', '401(k) & retirement', 'Health', 'Time off', 'Community (46)'],
    stats: [
      { label: 'Employer-paid benefits', value: '$20,400', sub: 'per year, excluding pay' },
      { label: '401(k) match', value: '4.0%', sub: 'of base, max $5,000' },
      { label: 'Paid time off', value: '20 days', sub: 'accrued monthly' },
      { label: 'Parental leave', value: '12 weeks', sub: 'fully paid, after 90 days' },
      { label: 'Evidence confidence', value: 'High', sub: '94% traced to documents', tone: 'highlight' },
    ],
    valueBreakdown: {
      total: '$20,400',
      items: [
        { label: 'Health premium', share: '47.1%', amount: '$9,600' },
        { label: '401(k) match', share: '24.5%', amount: '$5,000' },
        { label: 'Commuter + wellness', share: '12.7%', amount: '$2,600' },
        { label: 'Learning budget', share: '9.8%', amount: '$2,000' },
        { label: 'Student loan help', share: '5.9%', amount: '$1,200' },
      ],
    },
    coverage: [
      { label: 'Health & insurance', level: 'Full', score: 100 },
      { label: 'Retirement', level: 'Full', score: 100 },
      { label: 'Time off & leave', level: 'Full', score: 100 },
      { label: 'Family & caregiving', level: 'Partial', score: 85 },
      { label: 'Learning & career', level: 'Full', score: 100 },
      { label: 'Everyday benefits', level: 'Partial', score: 70 },
      { label: 'Equity & ownership', level: 'Limited', score: 40 },
      { label: 'Student loan support', level: 'Full', score: 100 },
    ],
    sources: [
      { label: 'Plan documents', share: '78%' },
      { label: 'Employee reports', share: '16%' },
      { label: 'Not documented', share: '6%' },
    ],
    peers: {
      title: 'How Northstar compares',
      subtitle: 'Percentile against 214 peer employers',
      scopes: ['Tech · 1k–5k staff', 'All employers'],
      percentiles: [
        { label: '401(k) match', value: 82 },
        { label: 'Parental leave', value: 88 },
        { label: 'Health', value: 71 },
        { label: 'Everyday', value: 65 },
        { label: 'Time off', value: 44 },
        { label: 'Learning', value: 31 },
      ],
      note: 'Strong retirement and parental leave. Time off and learning sit below the median.',
      scopeNote: 'Scoped: New York · full-time · 2026',
    },
    questions: {
      subtitle: 'Share of 318 questions on this company',
      topics: [
        { label: 'Vesting schedule', share: 37.9 },
        { label: 'How the match tiers work', share: 27.1 },
        { label: 'PTO carryover deadline', share: 17.9 },
        { label: 'HSA employer seed', share: 8.8 },
        { label: 'Parental leave eligibility', share: 2.5 },
        { label: 'Learning approval process', share: 2.4 },
        { label: 'Commuter pre-tax limits', share: 2.3 },
        { label: 'Student loan qualification', share: 1.1 },
      ],
      gapNote: 'Vesting and match tiers are 65% of every question asked here.',
      gapStatus: 'Northstar has been notified',
    },
  },
}

/* ---------- 03 · Compare ---------- */

export type CompareCell = {
  text: string
  /** Strongest documented value in the row. */
  best?: boolean
  muted?: boolean
  flag?: string
}

export type CompareScope = {
  location: string
  employment: 'Full-time, salaried' | 'Part-time'
  planYear: string
  baseSalary: number
}

export const compareConfig = {
  defaultCompanyIds: ['meridian', 'northstar', 'harbor'],
  maxCompanies: 4,
  defaultScope: {
    location: 'New York, United States',
    employment: 'Full-time, salaried',
    planYear: '2026',
    baseSalary: 125000,
  } as CompareScope,
  scopeOptions: {
    location: ['New York, United States', 'Boston, United States', 'San Francisco, United States', 'Remote, United States'],
    employment: ['Full-time, salaried', 'Part-time'] as CompareScope['employment'][],
    planYear: ['2026'],
    baseSalary: [90000, 110000, 125000, 150000, 180000],
  },
  stackLegend: ['Health premium', '401(k) match', 'Everyday', 'Learning', 'Loans'],
  priorities: 'Build savings early · Pay down student loans · Time off and flexibility',
}

/* ---------- 04 · My benefits dashboard ---------- */

export type ActionItem = {
  id: string
  title: string
  detail: string
  /** Where the action actually happens. */
  system: string
  systemUrl: string
  due?: string
  done: boolean
}

export const myBenefits = {
  intro:
    "Your Northstar Labs package for plan year 2026. This explains and tracks — enrolment and contribution changes still happen in Northstar's own systems.",
  asOf: 'As of 4 Feb 2026, 9:06 AM ET',
  totalValue: '$20,400',
  stats: [
    { label: '401(k) match next 12 months', value: '$5,000', sub: 'at your current 6%' },
    { label: 'PTO accrued so far', value: '1.7 days', sub: 'of 20 this year' },
    { label: 'Vested in employer match', value: '$0', sub: 'first milestone Feb 2027' },
    { label: 'Learning budget left', value: '$2,000', sub: 'resets 1 January' },
    { label: 'Actions open', value: '3', sub: '1 closes in 12 days', tone: 'flag' },
  ] as Stat[],
  explainer: [
    'Employer-paid value is what Northstar spends on you each year beyond salary, bonus and equity: its share of your health premium, the 401(k) match at your contribution rate, and the budgets you can draw on.',
    'Figures come from Northstar’s 2026 plan documents. Anything we could not trace to a document is shown as unknown and left out of totals — never counted as zero.',
    'This is education, not advice. Changes to your enrolment or contribution happen in Workday and Fidelity, not here.',
  ],
  actionPlan: [
    {
      id: 'a1', title: 'Enrol in the PPO medical plan', detail: 'Pick a plan and add dependants before the window closes.',
      system: 'Workday', systemUrl: 'https://www.workday.com', due: '16 Feb', done: false,
    },
    {
      id: 'a2', title: 'Elect dental + vision', detail: 'Included at no cost, but you still have to opt in.',
      system: 'Workday', systemUrl: 'https://www.workday.com', due: '16 Feb', done: false,
    },
    {
      id: 'a3', title: 'Set your 401(k) contribution', detail: 'You need 5% to collect the full Northstar match.',
      system: 'Fidelity NetBenefits', systemUrl: 'https://nb.fidelity.com', done: false,
    },
  ] as ActionItem[],
  setup: { done: 4, total: 7, valueDone: '$11,800', valueTotal: '$20,400', /** 0–1 */ ratio: 0.578, note: 'The rest needs an action from you — mostly in Workday and Fidelity.' },
  benefits: [
    { name: '401(k) — 4% employer match', category: 'Retirement', status: 'Action needed', tone: 'flag', value: '$5,000', to: '/my-benefits/401k' },
    { name: 'PPO medical plan', category: 'Health', status: 'Enrol by 16 Feb', tone: 'flag', value: '$9,600', to: '/companies/northstar?tab=health' },
    { name: 'Dental + vision', category: 'Health', status: 'Enrol by 16 Feb', tone: 'flag', value: 'included', to: '/companies/northstar?tab=health' },
    { name: 'Paid time off — 20 days', category: 'Time off', status: 'Active', tone: 'verified', value: '20 days', to: '/companies/northstar?tab=time-off' },
    { name: 'Learning budget', category: 'Learning', status: 'Unused', tone: 'default', value: '$2,000', to: '/companies/northstar' },
    { name: 'Student loan contribution', category: 'Loans', status: 'Eligible 2 Aug 2026', tone: 'default', value: '$1,200', to: '/companies/northstar' },
    { name: 'Commuter + wellness', category: 'Everyday', status: 'Active', tone: 'verified', value: '$2,600', to: '/companies/northstar' },
  ] as { name: string; category: string; status: string; tone: ChipToneName; value: string; to: string }[],
  quarters: [
    { label: 'Q1', total: '$4,600', segments: [38, 73, 29] },
    { label: 'Q2', total: '$5,900', segments: [38, 73, 69] },
    { label: 'Q3', total: '$4,600', segments: [38, 73, 29] },
    { label: 'Q4', total: '$5,300', segments: [38, 73, 50] },
  ],
  quarterLegend: ['401(k)', 'Health', 'Other'],
  breakdown: [
    { label: 'Health', share: '47.1%' },
    { label: '401(k)', share: '24.5%' },
    { label: 'Everyday', share: '12.7%' },
    { label: 'Learning', share: '9.8%' },
    { label: 'Loans', share: '5.9%' },
  ],
  vesting: [
    { step: 'Today', percent: '0%', vested: '$0 vested', date: 'Feb 2026', current: true },
    { step: 'Year 1', percent: '33%', vested: '$1,650 vested', date: 'Feb 2027' },
    { step: 'Year 2', percent: '67%', vested: '$3,350 vested', date: 'Feb 2028' },
    { step: 'Year 3', percent: '100%', vested: '$5,000 vested', date: 'Feb 2029' },
  ],
}

/* ---------- 05 · 401(k) explorer ---------- */

export const retirementExplorer = {
  verifiedOn: 'Plan facts verified 3 Feb 2026',
  companyId: 'northstar',
  employerShortName: 'Northstar',
  baseSalary: 125000,
  paychecksPerYear: 26,
  /** Your current contribution, % of pay. */
  contributionPercent: 6,
  maxContributionPercent: 10,
  vestingYears: 3,
  outOfScope: [
    {
      title: 'Your take-home pay',
      body: 'Contributions are pre-tax, so your paycheck drops by less than $288. By how much depends on your full tax situation, which we do not model.',
    },
    { title: 'What it grows to', body: 'No projections. Investment returns are not knowable, and a confident-looking curve would be a lie.' },
    { title: 'Whether you should', body: 'We show what the plan does. Whether 6% is right against your rent and loans is yours to decide.' },
  ],
  planOptions: [
    { title: 'Traditional 401(k)', body: 'Taxed later. Money comes out before income tax now; you pay tax when you withdraw.' },
    { title: 'Roth 401(k)', body: 'Taxed now. Money comes out after income tax; qualified withdrawals in retirement are not taxed.' },
  ],
  rothIraDetail:
    'A Roth IRA is an individual retirement account. You open it with any bank or broker, contribute after-tax money up to an annual IRS limit, and qualified withdrawals in retirement are tax-free. It sits alongside your 401(k): you can have both, but only the 401(k) gets an employer match.',
  handoff: { system: 'Fidelity NetBenefits', url: 'https://nb.fidelity.com' },
  source: 'Northstar 401(k) Summary Plan Description 2026, s.4.2, p.14',
}

/* ---------- 06 · Community & contribute ---------- */

export type CommunityReply = { id: string; author: string; body: string; when: string }

export type CommunityPost = {
  id: string
  companyId: string
  company: string
  kind: string
  tone: ChipToneName
  meta: string
  title: string
  body: string
  helpful: number
  employerAnswer?: { author: string; when: string; body: string }
  replies?: CommunityReply[]
}

export const communityPage = {
  filters: [
    { label: 'Everything', count: 420 },
    { label: 'Questions', count: 186 },
    { label: 'Employer answers', count: 64 },
    { label: 'Corrections', count: 37 },
    { label: 'Experience reports', count: 133 },
  ],
  /** Seed for the companies the user follows. */
  followingIds: ['northstar', 'harbor', 'meridian'],
  sorts: ['Newest', 'Unanswered', 'Most helpful'],
  posts: [
    {
      id: 'p1',
      companyId: 'northstar',
      company: 'Northstar Labs',
      kind: 'Question',
      tone: 'default',
      meta: '2 hours ago · 3 replies',
      title: 'Does the 3-year vesting restart if I move to a different team?',
      body: 'Moving from Engineering to Product internally. Nobody could tell me whether service time carries over for the employer match.',
      helpful: 24,
      employerAnswer: {
        author: 'Dana K. · People Ops',
        when: 'Answered 1h ago',
        body: 'Service time is continuous for internal moves — your vesting clock does not restart. We have added this to the 401(k) page so it stops coming up.',
      },
    },
    {
      id: 'p2',
      companyId: 'harbor',
      company: 'Harbor Systems',
      kind: 'Correction',
      tone: 'flag',
      meta: '5 hours ago · under review',
      title: 'PTO is listed as unlimited, but the handbook sets a 10-day minimum',
      body: 'Attached p.19 of the 2026 handbook. The profile currently shows no documented floor, which makes Harbor look worse than it is.',
      helpful: 24,
    },
    {
      id: 'p3',
      companyId: 'meridian',
      company: 'Meridian Health',
      kind: 'Experience',
      tone: 'teal',
      meta: 'Yesterday · 41 found this helpful',
      title: 'Fertility benefit took 6 weeks end to end — here is the sequence',
      body: 'Pre-authorisation first, then the clinic bills Meridian directly. The $25,000 is lifetime, not annual, which is not obvious from the summary.',
      helpful: 24,
    },
    {
      id: 'p4',
      companyId: 'northstar',
      company: 'Northstar Labs',
      kind: 'Question',
      tone: 'default',
      meta: '6 hours ago · 0 replies',
      title: 'Is the HSA seed paid up front or per paycheck?',
      body: 'Enrolling in the high-deductible plan and trying to work out whether I need to cover the first few months myself.',
      helpful: 11,
    },
    {
      id: 'p5',
      companyId: 'northstar',
      company: 'Northstar Labs',
      kind: 'Question',
      tone: 'default',
      meta: 'Yesterday · 1 reply',
      title: 'Can PTO carry over past 31 March, or is it 31 December?',
      body: 'The handbook and my offer letter say different things. I have 6 days left and need to know before I book anything.',
      helpful: 18,
    },
    {
      id: 'p6',
      companyId: 'cobalt',
      company: 'Cobalt Finance',
      kind: 'Experience',
      tone: 'teal',
      meta: '2 days ago · 12 found this helpful',
      title: 'The 5% match is real, but it lands quarterly',
      body: 'Contributions go in every paycheck; Cobalt deposits its match at the end of each quarter. Worth knowing if you leave mid-quarter.',
      helpful: 12,
    },
  ] as CommunityPost[],
  contributeSteps: [
    { title: 'Pick your employer and plan year', body: 'We prefill anything already published.' },
    { title: 'Upload or type what you have', body: 'An offer letter, a benefits summary, or just the numbers you know.' },
    { title: 'We check it before it publishes', body: 'Document-backed fields outrank typed ones. Your name is never attached.' },
  ],
  contributors: [
    { rank: '1', name: 'A. Okafor', fields: 312 },
    { rank: '2', name: 'R. Mehta', fields: 208 },
    { rank: '3', name: 'J. Lindqvist', fields: 177 },
    { rank: '—', name: 'You', fields: 12, isYou: true },
  ],
  employerRules: [
    { allowed: true, text: 'Correct a factual error about their own package, logged with a date.' },
    { allowed: true, text: 'Answer a question on the record, labelled as an employer answer.' },
    { allowed: false, text: 'Change a score, reorder a comparison, or delete an employee report.' },
    { allowed: false, text: 'See who asked what. Questions reach them without an identity.' },
    { allowed: false, text: 'Pay to rank higher. Payment buys publishing tools, not placement.' },
  ],
}

/* ---------- 07 · Employer dashboard ---------- */

export type EmployerDecision = {
  id: string
  kind: string
  tone: ChipToneName
  title: string
  body: string
  action: string
  sources: string[]
  resolve:
    | { type: 'choose'; prompt: string; options: string[] }
    | { type: 'amount'; prompt: string }
    | { type: 'upload'; prompt: string }
}

export const employerDashboard = {
  org: 'Northstar Labs · People Ops',
  tabs: ['Dashboard', 'Benefits profile', 'Understanding', 'Community responses', 'Benchmarks'],
  title: 'Northstar Labs · 2026 benefits profile',
  intro:
    'Two jobs here: keep the published facts right, then see where your explanations are failing people. Everything below is aggregate.',
  asOf: 'As of 4 Feb 2026 · 118 employees active in the last 30 days',
  /** Published-with-source vs total fields; resolving decisions moves this. */
  fields: { published: 111, total: 118 },
  stats: [
    { label: 'Employees reached', value: '118', sub: 'of 1,200 · 30 days' },
    { label: 'Open questions', value: '23', sub: 'median reply 1.4 days' },
    { label: 'Fields in conflict', value: '3', sub: 'blocking a clean publish', tone: 'flag' },
    { label: 'Benchmark position', value: '68th', sub: 'percentile, tech 1k–5k' },
    { label: 'Community corrections', value: '7', sub: '4 accepted, 3 in review' },
  ] as Stat[],
  /** Share of published fields by source, in percent. */
  sourceSplit: { documents: 78, reports: 16, undocumented: 6 },
  activeEmployees: 118,
  gaps: [
    { topic: 'Vesting schedule', affected: 42, signal: 'Re-reads, then asks', tone: 'flag', fix: 'Add a dated timeline to onboarding' },
    { topic: 'How the match tiers work', affected: 31, signal: 'Answers 3% not 5%', tone: 'flag', fix: 'State the 5% line in sentence one' },
    { topic: 'PTO carryover deadline', affected: 24, signal: 'Documents disagree', tone: 'flag', fix: 'Resolve the conflict below' },
    { topic: 'Tuition approval order', affected: 19, signal: 'Fails at approval', tone: 'default', fix: 'Move approval rule into the summary' },
    { topic: 'HSA employer seed', affected: 14, signal: 'No published figure', tone: 'default', fix: 'Publish the amount' },
  ] as { topic: string; affected: number; signal: string; tone: ChipToneName; fix: string }[],
  rank: [
    { label: 'Parental', value: 88 },
    { label: '401(k)', value: 82 },
    { label: 'Health', value: 71 },
    { label: 'Everyday', value: 65 },
    { label: 'Time off', value: 44 },
    { label: 'Learning', value: 31 },
  ] as Percentile[],
  rankNote: 'Time off and learning are your weakest categories — and both are already in the top five things people ask about.',
  decisions: [
    {
      id: 'd-pto',
      resolve: {
        type: 'choose',
        prompt: 'Which carryover deadline is correct for plan year 2026?',
        options: ['31 March — Handbook p.24', '31 December — Offer letter template'],
      },
      sources: ['Employee Handbook 2026, p.24', 'Offer letter template v3 (Oct 2025)', '1 employee correction, 24 related questions'],
      kind: 'Conflict',
      tone: 'flag',
      title: 'Two different PTO carryover deadlines',
      body: 'Handbook p.24 says 31 March. The offer letter template says 31 December. One employee flagged it; 24 more have asked. Employees currently see both, marked disputed — we will not pick one for you.',
      action: 'Resolve',
    },
    {
      id: 'd-hsa',
      resolve: { type: 'amount', prompt: 'Annual HSA employer contribution for 2026 (USD)' },
      sources: ['Benefits Guide 2026 — not stated', 'Summary of Benefits and Coverage — not stated', '14 employee questions'],
      kind: 'Missing',
      tone: 'muted',
      title: 'No HSA employer contribution on record',
      body: 'None of your four uploaded documents states what Northstar seeds into an HSA. Employees see Unknown, not $0 — but enrolment closes 16 February, so this is the field most likely to cost someone money.',
      action: 'Add figure',
    },
    {
      id: 'd-guide',
      resolve: { type: 'upload', prompt: 'Upload the 2026 Benefits Guide to replace the 2025 source' },
      sources: ['Benefits Guide 2025 (superseded)', 'Cited by 14 fields: dental, vision, commuter'],
      kind: 'Outdated',
      tone: 'flag',
      title: '14 fields still cite the 2025 Benefits Guide',
      body: 'Dental, vision and commuter details come from a superseded document. They may still be correct, but they are why your evidence confidence reads Medium to candidates comparing you.',
      action: 'Replace source',
    },
  ] as EmployerDecision[],
  neverShown: [
    'Who opened what. No employee-level view exists, including for admins.',
    "Anyone's salary, contribution scenario or saved action plan.",
    'Individual quiz answers — only the aggregate miss rate on a question.',
    'Any figure covering fewer than 10 people. It reads Insufficient data.',
    'Whether a named employee uses a benefit. There is no usage data at all.',
    'Who asked a question. Questions reach you without an identity attached.',
  ],
}

/* ---------- Response shapes, derived from the mock payloads ---------- */

export type MyBenefits = typeof myBenefits
export type RetirementExplorer = typeof retirementExplorer
export type CommunityPageData = typeof communityPage
export type EmployerDashboard = typeof employerDashboard
export type CompanyFollowing = { id: string; name: string; count: number }
