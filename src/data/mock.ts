// Hardcoded mock data for the Explore page.
// Replace these exports with API calls when a backend is available.

export type NavTab = {
  id: string
  label: string
  to: string
  hasMenu?: boolean
}

export type User = {
  firstName: string
  shortName: string
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
}

export type RankingMetric = {
  id: string
  label: string
}

export type RankingRow = {
  label: string
  /** Value in percent. */
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

export const currentUser: User = { firstName: 'Maya', shortName: 'Maya R.' }

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

export const roles: string[] = [
  'Product Manager',
  'Software Engineer',
  'Data Scientist',
  'Designer',
  'Analyst',
  'Marketing',
]

export const companies: Company[] = [
  { id: 'northstar', name: 'Northstar Labs', annualValue: 20400, matchPercent: 4, timeOff: '20d PTO', reportCount: 46 },
  { id: 'harbor', name: 'Harbor Systems', annualValue: 16250, matchPercent: 3, timeOff: 'Unlimited', reportCount: 31 },
  { id: 'meridian', name: 'Meridian Health', annualValue: 23900, matchPercent: 6, timeOff: '25d PTO', reportCount: 88 },
  { id: 'cobalt', name: 'Cobalt Finance', annualValue: 18700, matchPercent: 5, timeOff: '18d PTO', reportCount: 124 },
  { id: 'polaris', name: 'Polaris Retail', annualValue: 9400, matchPercent: 2, timeOff: '15d PTO', reportCount: 57 },
]

export const rankingsSection = {
  title: 'Who matches the most',
  subtitle: 'Employer 401(k) contribution as a share of base salary',
}

export const rankingMetrics: RankingMetric[] = [
  { id: '401k', label: '401(k) match' },
  { id: 'health', label: 'Health coverage' },
  { id: 'time-off', label: 'Time off' },
  { id: 'parental', label: 'Parental leave' },
]

/** Rows per metric id. Only 401(k) has data in the design. */
export const rankings: Record<string, RankingRow[]> = {
  '401k': [
    { label: 'Meridian Health', value: 6.0 },
    { label: 'Cobalt Finance', value: 5.0 },
    { label: 'Northstar Labs', value: 4.0 },
    { label: 'Vertex Logistics', value: 3.5 },
    { label: 'Harbor Systems', value: 3.0 },
    { label: 'Polaris Retail', value: 2.0 },
    { label: 'Industry median', value: 3.2, isBenchmark: true },
  ],
}

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

export type CompareEmployer = {
  name: string
  isYours?: boolean
  totalValue: string
  /** Value stack segment widths in px, in legend order. */
  stack: number[]
}

export const compareView = {
  scope: [
    { label: 'Location', value: 'New York, United States', options: ['New York, United States', 'San Francisco, United States', 'Remote, United States'] },
    { label: 'Employment type', value: 'Full-time, salaried', options: ['Full-time, salaried', 'Part-time', 'Contract'] },
    { label: 'Plan year', value: '2026', options: ['2026', '2025'] },
    { label: 'Base salary for % figures', value: '$125,000', options: ['$100,000', '$125,000', '$150,000'] },
  ],
  stackLegend: ['Health premium', '401(k) match', 'Everyday', 'Learning', 'Loans'],
  employers: [
    { name: 'Meridian Health', totalValue: '$23,900', stack: [262, 176, 56, 42, 23] },
    { name: 'Northstar Labs', isYours: true, totalValue: '$20,400', stack: [225, 117, 61, 47, 28] },
    { name: 'Harbor Systems', totalValue: '$16,250', stack: [169, 95, 42, 75] },
  ] as CompareEmployer[],
  matrix: [
    { benefit: '401(k) match', cells: [{ text: '6% of base · $7,500', best: true }, { text: '4% of base · $5,000' }, { text: '3% of base · $4,050' }] },
    { benefit: 'Match vesting', cells: [{ text: '5-year graded' }, { text: '3-year graded' }, { text: 'Immediate', best: true }] },
    { benefit: 'Health premium covered', cells: [{ text: '90% · $11,200', best: true }, { text: '80% · $9,600' }, { text: '70% · $7,200' }] },
    { benefit: 'Paid time off', cells: [{ text: '25 days accrued', best: true }, { text: '20 days accrued' }, { text: '“Unlimited”', flag: 'No documented minimum' }] },
    { benefit: 'Parental leave', cells: [{ text: '16 weeks paid', best: true }, { text: '12 weeks paid' }, { text: '8 weeks paid' }] },
    { benefit: 'Learning budget', cells: [{ text: '$1,800 / yr' }, { text: '$2,000 / yr' }, { text: '$3,200 / yr', best: true }] },
    { benefit: 'Student loan help', cells: [{ text: '$1,000 / yr' }, { text: '$1,200 / yr', best: true }, { text: 'Not offered', muted: true }] },
    { benefit: 'HSA employer seed', cells: [{ text: '$1,500 / yr', best: true }, { text: 'Not documented', muted: true, flag: 'Requested 2 Feb' }, { text: '$750 / yr' }] },
  ] as { benefit: string; cells: CompareCell[] }[],
  priorities: 'Build savings early · Pay down student loans · Time off and flexibility',
  fit: [
    { name: 'Meridian Health', note: 'Best savings, no loan support', score: 74, isYours: false },
    { name: 'Northstar Labs', note: 'Only one with student loan help', score: 81, isYours: true },
    { name: 'Harbor Systems', note: 'Unlimited PTO has no documented floor', score: 52, isYours: false },
  ],
  unknowns: [
    { field: 'HSA employer seed', detail: 'Northstar Labs · Requested 2 Feb 2026' },
    { field: 'PTO minimum', detail: 'Harbor Systems · No floor documented' },
    { field: 'Dental & vision detail', detail: 'Harbor Systems · 2025 document only' },
    { field: 'Commuter benefit', detail: 'Meridian Health · Not published' },
  ],
}

/* ---------- 04 · My benefits dashboard ---------- */

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
  setup: { done: 4, total: 7, valueDone: '$11,800', valueTotal: '$20,400', /** 0–1 */ ratio: 0.578, note: 'The rest needs an action from you — mostly in Workday and Fidelity.' },
  benefits: [
    { name: '401(k) — 4% employer match', category: 'Retirement', status: 'Action needed', tone: 'flag', value: '$5,000' },
    { name: 'PPO medical plan', category: 'Health', status: 'Enrol by 16 Feb', tone: 'flag', value: '$9,600' },
    { name: 'Dental + vision', category: 'Health', status: 'Enrol by 16 Feb', tone: 'flag', value: 'included' },
    { name: 'Paid time off — 20 days', category: 'Time off', status: 'Active', tone: 'verified', value: '20 days' },
    { name: 'Learning budget', category: 'Learning', status: 'Unused', tone: 'default', value: '$2,000' },
    { name: 'Student loan contribution', category: 'Loans', status: 'Eligible 2 Aug 2026', tone: 'default', value: '$1,200' },
    { name: 'Commuter + wellness', category: 'Everyday', status: 'Active', tone: 'verified', value: '$2,600' },
  ] as { name: string; category: string; status: string; tone: ChipToneName; value: string }[],
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
  /** Scenario contribution, % of pay. */
  contributionPercent: 6,
  stats: [
    { label: 'You contribute', value: '$7,500', sub: '6% of $125,000, ~$288 a paycheck' },
    { label: 'Northstar adds', value: '$5,000', sub: 'the full match — you are above 5%', tone: 'highlight' },
    { label: 'Into your account', value: '$12,500', sub: "before any growth, which we don't predict" },
    { label: 'Yours if you left today', value: '$7,500', sub: 'their match vests over 3 years' },
  ] as Stat[],
  insight: {
    title: "Drop to 3% and Northstar's share falls to $3,750 — $1,250 a year less.",
    sub: 'Anything above 5% is all yours. Still saved, just not matched.',
  },
  scenarios: [
    { contribute: '3%', fromPay: '$3,750', employer: '$3,750', total: '$7,500', leftBehind: '$1,250' },
    { contribute: '5%', fromPay: '$6,250', employer: '$5,000', total: '$11,250', leftBehind: 'nothing' },
    { contribute: '6% — your scenario', fromPay: '$7,500', employer: '$5,000', total: '$12,500', leftBehind: 'nothing', current: true },
    { contribute: '10%', fromPay: '$12,500', employer: '$5,000', total: '$17,500', leftBehind: 'nothing' },
  ],
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
  assumptions: [
    { label: 'Salary', value: '$125,000 — from your offer letter' },
    { label: 'Paychecks', value: '26 a year, every two weeks' },
    { label: 'Amounts', value: 'Gross. No tax, growth or fees applied' },
    { label: 'Plan year', value: '2026. Annual IRS limits are not modelled' },
    { label: 'Match rule', value: '100% of first 3%, 50% of next 2%' },
  ],
  source: 'Northstar 401(k) Summary Plan Description 2026, s.4.2, p.14',
}

/* ---------- 06 · Community & contribute ---------- */

export type CommunityPost = {
  id: string
  company: string
  kind: string
  tone: ChipToneName
  meta: string
  title: string
  body: string
  helpful: number
  employerAnswer?: { author: string; when: string; body: string }
}

export const communityPage = {
  filters: [
    { label: 'Everything', count: 420 },
    { label: 'Questions', count: 186 },
    { label: 'Employer answers', count: 64 },
    { label: 'Corrections', count: 37 },
    { label: 'Experience reports', count: 133 },
  ],
  following: [
    { name: 'Northstar Labs', count: 46 },
    { name: 'Harbor Systems', count: 31 },
    { name: 'Meridian Health', count: 88 },
  ],
  sorts: ['Newest', 'Unanswered', 'Most helpful'],
  posts: [
    {
      id: 'p1',
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
      company: 'Meridian Health',
      kind: 'Experience',
      tone: 'teal',
      meta: 'Yesterday · 41 found this helpful',
      title: 'Fertility benefit took 6 weeks end to end — here is the sequence',
      body: 'Pre-authorisation first, then the clinic bills Meridian directly. The $25,000 is lifetime, not annual, which is not obvious from the summary.',
      helpful: 24,
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

export const employerDashboard = {
  org: 'Northstar Labs · People Ops',
  tabs: ['Dashboard', 'Benefits profile', 'Understanding', 'Community responses', 'Benchmarks'],
  title: 'Northstar Labs · 2026 benefits profile',
  intro:
    'Two jobs here: keep the published facts right, then see where your explanations are failing people. Everything below is aggregate.',
  asOf: 'As of 4 Feb 2026 · 118 employees active in the last 30 days',
  completeness: { value: '94%', sub: '111 of 118 fields published with a source' },
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
      kind: 'Conflict',
      tone: 'flag',
      title: 'Two different PTO carryover deadlines',
      body: 'Handbook p.24 says 31 March. The offer letter template says 31 December. One employee flagged it; 24 more have asked. Employees currently see both, marked disputed — we will not pick one for you.',
      action: 'Resolve',
    },
    {
      kind: 'Missing',
      tone: 'muted',
      title: 'No HSA employer contribution on record',
      body: 'None of your four uploaded documents states what Northstar seeds into an HSA. Employees see Unknown, not $0 — but enrolment closes 16 February, so this is the field most likely to cost someone money.',
      action: 'Add figure',
    },
    {
      kind: 'Outdated',
      tone: 'flag',
      title: '14 fields still cite the 2025 Benefits Guide',
      body: 'Dental, vision and commuter details come from a superseded document. They may still be correct, but they are why your evidence confidence reads Medium to candidates comparing you.',
      action: 'Replace source',
    },
  ] as { kind: string; tone: ChipToneName; title: string; body: string; action: string }[],
  neverShown: [
    'Who opened what. No employee-level view exists, including for admins.',
    "Anyone's salary, contribution scenario or saved action plan.",
    'Individual quiz answers — only the aggregate miss rate on a question.',
    'Any figure covering fewer than 10 people. It reads Insufficient data.',
    'Whether a named employee uses a benefit. There is no usage data at all.',
    'Who asked a question. Questions reach you without an identity attached.',
  ],
}
