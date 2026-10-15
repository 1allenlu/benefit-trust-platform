// Hardcoded mock data for the Explore page.
// Replace these exports with API calls when a backend is available.

export type NavTab = {
  id: string
  label: string
  hasMenu?: boolean
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
  { id: 'explore', label: 'Explore', hasMenu: true },
  { id: 'companies', label: 'Companies', hasMenu: true },
  { id: 'compare', label: 'Compare' },
  { id: 'community', label: 'Community' },
  { id: 'my-benefits', label: 'My benefits' },
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
