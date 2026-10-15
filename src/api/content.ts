import {
  communityItems,
  communityPage,
  companyRecords,
  defaultBaseSalary,
  employerDashboard,
  heroStats,
  industries,
  industryMedians,
  moreIndustries,
  moreRoles,
  myBenefits,
  rankingCompanyIds,
  rankingMetrics,
  retirementExplorer,
  roles,
  yourCompanyId,
  type ActionItem,
  type Company,
  type CompanyRecord,
  type CompanySort,
  type CompareScope,
  type RankingMetric,
  type RankingRow,
} from '../data/mock'
import {
  buildMatrix,
  maxMatchPercent,
  summarize,
  totalValue,
  unknownsFor,
  usd,
  valueParts,
} from '../lib/benefits'
import { ApiError, request } from './client'
import { getDb, newId, resetMockDb, updateDb } from './mock/db'
import { buildProfile } from './mock/profiles'

/* ---------- Search ---------- */

export type CompanySearchParams = {
  /** Free text: company, city, industry, role — or a benefit like "parental leave". */
  q?: string
  industry?: string | null
  role?: string | null
  sort?: CompanySort
}

export type SearchResult = {
  companies: Company[]
  /** Set when the query names a benefit: results are ranked by it. */
  benefitFocus?: string
}

type BenefitSearch = {
  label: string
  pattern: RegExp
  score: (r: CompanyRecord) => number | null
  describe: (r: CompanyRecord) => string
}

const num = (v: number | string) => (typeof v === 'number' ? v : null)

const benefitSearches: BenefitSearch[] = [
  {
    label: '401(k) match',
    pattern: /401|match|retire/i,
    score: (r) => maxMatchPercent(r.facts.matchTiers),
    describe: (r) => `${maxMatchPercent(r.facts.matchTiers)}% match · ${r.facts.vesting.toLowerCase()}`,
  },
  {
    label: 'health coverage',
    pattern: /health|medical|premium|insurance/i,
    score: (r) => r.facts.healthCoveredPct,
    describe: (r) => `${r.facts.healthCoveredPct}% of premium covered`,
  },
  {
    label: 'parental leave',
    pattern: /parent|maternity|paternity|family|leave/i,
    score: (r) => r.facts.parentalWeeks,
    describe: (r) => `${r.facts.parentalWeeks} weeks paid leave`,
  },
  {
    label: 'time off',
    pattern: /pto|time off|vacation|holiday/i,
    score: (r) => num(r.facts.ptoDays),
    describe: (r) => (r.facts.ptoDays === 'unlimited' ? 'Unlimited, no documented minimum' : `${r.facts.ptoDays} days PTO`),
  },
  {
    label: 'learning budget',
    pattern: /learn|tuition|education|training/i,
    score: (r) => num(r.facts.learningBudget),
    describe: (r) => (typeof r.facts.learningBudget === 'number' ? `${usd.format(r.facts.learningBudget)} learning / yr` : 'No learning budget'),
  },
  {
    label: 'student loan help',
    pattern: /loan|student|debt/i,
    score: (r) => num(r.facts.studentLoan),
    describe: (r) => (typeof r.facts.studentLoan === 'number' ? `${usd.format(r.facts.studentLoan)} loan help / yr` : 'Loan help not documented'),
  },
  {
    label: 'HSA seed',
    pattern: /hsa/i,
    score: (r) => num(r.facts.hsaSeed),
    describe: (r) => (typeof r.facts.hsaSeed === 'number' ? `${usd.format(r.facts.hsaSeed)} HSA seed` : 'HSA seed not documented'),
  },
]

const sorters: Record<CompanySort, (a: Company, b: Company) => number> = {
  'value-desc': (a, b) => b.annualValue - a.annualValue,
  'value-asc': (a, b) => a.annualValue - b.annualValue,
  'match-desc': (a, b) => b.matchPercent - a.matchPercent,
  'reports-desc': (a, b) => b.reportCount - a.reportCount,
}

const textMatches = (r: CompanyRecord, needle: string) =>
  [r.name, r.city, ...r.industries, ...r.roles].some((field) => field.toLowerCase().includes(needle))

/** What a backend would do for GET /companies. */
function searchCompaniesMock({ q = '', industry, role, sort = 'value-desc' }: CompanySearchParams): SearchResult {
  const needle = q.trim().toLowerCase()
  const filtered = companyRecords
    .filter((r) => !industry || r.industries.includes(industry))
    .filter((r) => !role || r.roles.includes(role))

  const benefit = needle && !filtered.some((r) => textMatches(r, needle)) ? benefitSearches.find((b) => b.pattern.test(needle)) : undefined
  if (benefit) {
    // Companies that don't document the benefit go last instead of being scored as zero.
    const ranked = [...filtered].sort((a, b) => (benefit.score(b) ?? -1) - (benefit.score(a) ?? -1))
    return {
      benefitFocus: benefit.label,
      companies: ranked.map((r) => ({ ...summarize(r, defaultBaseSalary), highlight: benefit.describe(r) })),
    }
  }

  return {
    companies: filtered
      .filter((r) => !needle || textMatches(r, needle))
      .map((r) => summarize(r, defaultBaseSalary))
      .sort(sorters[sort]),
  }
}

function suggestMock(q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return { companies: [], benefits: [] }
  return {
    companies: companyRecords
      .filter((r) => textMatches(r, needle))
      .slice(0, 5)
      .map((r) => ({ id: r.id, name: r.name, detail: `${r.industries[0]} · ${r.city}` })),
    benefits: benefitSearches.filter((b) => b.pattern.test(needle)).map((b) => b.label),
  }
}

/* ---------- Rankings ---------- */

const metricValue: Record<RankingMetric['id'], (r: CompanyRecord) => number | null> = {
  '401k': (r) => maxMatchPercent(r.facts.matchTiers),
  health: (r) => r.facts.healthCoveredPct,
  'time-off': (r) => num(r.facts.ptoDays),
  parental: (r) => r.facts.parentalWeeks,
}

function rankingsMock() {
  const records = rankingCompanyIds.map((id) => companyRecords.find((r) => r.id === id)!)
  return Object.fromEntries(
    rankingMetrics.map((metric) => {
      const rows: RankingRow[] = records
        .map((r) => ({ label: r.name, value: metricValue[metric.id](r) }))
        .filter((row): row is RankingRow => row.value !== null)
        .sort((a, b) => b.value - a.value)
      rows.push({ label: 'Industry median', value: industryMedians[metric.id], isBenchmark: true })
      return [metric.id, rows]
    }),
  ) as Record<RankingMetric['id'], RankingRow[]>
}

/* ---------- Helpers ---------- */

const recordById = (id: string) => {
  const record = companyRecords.find((r) => r.id === id)
  if (!record) throw new ApiError(404, 'Profile not published yet')
  return record
}

/** Pixels per dollar in the Compare value stack (Meridian's $23,900 ≈ 560px). */
const STACK_PX_PER_DOLLAR = 559 / 23900

function toQuery(params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value)
  const str = search.toString()
  return str ? `?${str}` : ''
}

function communityMock() {
  const db = getDb()
  return {
    ...communityPage,
    posts: db.posts,
    helpfulPostIds: db.helpfulPostIds,
    following: db.followingIds.map((id) => {
      const r = recordById(id)
      return { id, name: r.name, count: r.reportCount }
    }),
    contributors: communityPage.contributors.map((c) => (c.isYou ? { ...c, fields: db.contributedFields } : c)),
    companies: companyRecords.map((r) => ({ id: r.id, name: r.name })),
  }
}

function employerMock() {
  const db = getDb()
  const resolvedCount = Object.keys(db.resolvedDecisions).length
  const decisions = employerDashboard.decisions.filter((d) => !db.resolvedDecisions[d.id])
  const fields = {
    published: employerDashboard.fields.published + ('d-hsa' in db.resolvedDecisions ? 1 : 0) + ('d-pto' in db.resolvedDecisions ? 1 : 0),
    total: employerDashboard.fields.total,
  }
  const questions = db.posts.filter((p) => p.companyId === yourCompanyId && p.kind === 'Question')
  return {
    ...employerDashboard,
    decisions,
    resolvedCount,
    fields,
    stats: employerDashboard.stats.map((stat) =>
      stat.label === 'Fields in conflict'
        ? { ...stat, value: String(decisions.length), sub: decisions.length ? 'blocking a clean publish' : 'ready to publish', tone: decisions.length ? 'flag' : 'default' }
        : stat.label === 'Open questions'
          ? { ...stat, value: String(23 - questions.filter((q) => q.employerAnswer).length + 1) }
          : stat,
    ) as typeof employerDashboard.stats,
    questions,
  }
}

/* ---------- Endpoints ---------- */

export const contentApi = {
  getExploreOverview: () =>
    request('/explore', {
      mock: () => ({
        heroStats,
        industries,
        moreIndustries,
        roles,
        moreRoles,
        rankingMetrics,
        rankings: rankingsMock(),
        communityItems,
      }),
    }),

  searchCompanies: (params: CompanySearchParams) =>
    request<SearchResult>(`/companies${toQuery({ ...params })}`, { mock: () => searchCompaniesMock(params) }),

  suggest: (q: string) => request(`/search/suggest${toQuery({ q })}`, { mock: () => suggestMock(q) }),

  listCompanies: () =>
    request('/companies/index', { mock: () => companyRecords.map((r) => ({ id: r.id, name: r.name, detail: r.industries[0] })) }),

  getCompanyProfile: (id: string) =>
    request(`/companies/${encodeURIComponent(id)}/profile`, {
      mock: () => {
        const record = recordById(id)
        const db = getDb()
        return {
          profile: buildProfile(record),
          record,
          isYourEmployer: id === yourCompanyId,
          following: db.followingIds.includes(id),
          posts: db.posts.filter((p) => p.companyId === id),
        }
      },
    }),

  setFollowing: (companyId: string, following: boolean) =>
    request<{ following: boolean }>(`/companies/${encodeURIComponent(companyId)}/follow`, {
      method: following ? 'PUT' : 'DELETE',
      mock: () =>
        updateDb((db) => {
          db.followingIds = following
            ? [...new Set([...db.followingIds, companyId])]
            : db.followingIds.filter((id) => id !== companyId)
          return { following }
        }),
    }),

  getCompare: (companyIds: string[], scope: CompareScope) =>
    request(`/compare${toQuery({ ids: companyIds.join(','), salary: String(scope.baseSalary), employment: scope.employment })}`, {
      mock: () => {
        const records = companyIds.map(recordById)
        return {
          columns: records.map((r) => {
            const parts = valueParts(r.facts, scope.baseSalary)
            return {
              id: r.id,
              name: r.name,
              isYours: r.id === yourCompanyId,
              totalValue: usd.format(totalValue(parts)),
              stack: [parts.health, parts.match, parts.everyday, parts.learning, parts.loans]
                .map((dollars) => Math.round(dollars * STACK_PX_PER_DOLLAR))
                .filter((width, i, all) => width > 0 || i < all.length - 1),
            }
          }),
          matrix: buildMatrix(records, scope),
          fit: records.map((r) => ({ name: r.name, isYours: r.id === yourCompanyId, ...r.fit })),
          unknowns: unknownsFor(records),
          available: companyRecords.filter((r) => !companyIds.includes(r.id)).map((r) => ({ id: r.id, name: r.name })),
          saved: getDb().savedComparison,
        }
      },
    }),

  saveComparison: (companyIds: string[], scope: CompareScope) =>
    request('/compare/saved', {
      method: 'PUT',
      body: { companyIds, scope },
      mock: () =>
        updateDb((db) => {
          db.savedComparison = { companyIds, scope, savedAt: new Date().toISOString() }
          return db.savedComparison
        }),
    }),

  getMyBenefits: () => request('/me/benefits', { mock: () => ({ ...myBenefits, actionPlan: getDb().actionPlan }) }),

  addAction: (item: Omit<ActionItem, 'id' | 'done'>) =>
    request<ActionItem>('/me/actions', {
      method: 'POST',
      body: item,
      mock: () =>
        updateDb((db) => {
          const existing = db.actionPlan.find((a) => a.title === item.title && !a.done)
          if (existing) return existing
          const created = { ...item, id: newId('a'), done: false }
          db.actionPlan = [...db.actionPlan, created]
          return created
        }),
    }),

  setActionDone: (id: string, done: boolean) =>
    request<ActionItem[]>(`/me/actions/${id}`, {
      method: 'PUT',
      body: { done },
      mock: () =>
        updateDb((db) => {
          db.actionPlan = db.actionPlan.map((a) => (a.id === id ? { ...a, done } : a))
          return db.actionPlan
        }),
    }),

  getRetirementExplorer: () =>
    request('/me/retirement', {
      mock: () => ({ ...retirementExplorer, matchTiers: recordById(retirementExplorer.companyId).facts.matchTiers }),
    }),

  getCommunity: () => request('/community', { mock: communityMock }),

  createPost: (input: { companyId: string; kind: 'Question' | 'Correction' | 'Experience'; title: string; body: string }) =>
    request('/community/posts', {
      method: 'POST',
      body: input,
      mock: () =>
        updateDb((db) => {
          const tone = input.kind === 'Correction' ? 'flag' : input.kind === 'Experience' ? 'teal' : 'default'
          const post = {
            id: newId('p'),
            companyId: input.companyId,
            company: recordById(input.companyId).name,
            kind: input.kind,
            tone,
            meta: input.kind === 'Correction' ? 'Just now · under review' : 'Just now · 0 replies',
            title: input.title,
            body: input.body,
            helpful: 0,
          } as const
          db.posts = [post, ...db.posts]
          return post
        }),
    }),

  replyToPost: (postId: string, body: string, author: string) =>
    request(`/community/posts/${postId}/replies`, {
      method: 'POST',
      body: { body },
      mock: () =>
        updateDb((db) => {
          const reply = { id: newId('r'), author, body, when: 'Just now' }
          db.posts = db.posts.map((p) => (p.id === postId ? { ...p, replies: [...(p.replies ?? []), reply] } : p))
          return reply
        }),
    }),

  setHelpful: (postId: string, helpful: boolean) =>
    request<{ helpful: boolean }>(`/community/posts/${encodeURIComponent(postId)}/helpful`, {
      method: helpful ? 'PUT' : 'DELETE',
      mock: () =>
        updateDb((db) => {
          db.helpfulPostIds = helpful
            ? [...new Set([...db.helpfulPostIds, postId])]
            : db.helpfulPostIds.filter((id) => id !== postId)
          return { helpful }
        }),
    }),

  submitContribution: (input: { companyId: string; planYear: string; fields: Record<string, string>; documentName?: string }) =>
    request<{ fieldsSubmitted: number; contributedFields: number }>('/contributions', {
      method: 'POST',
      body: input,
      mock: () =>
        updateDb((db) => {
          const fieldsSubmitted = Object.values(input.fields).filter((v) => v.trim()).length + (input.documentName ? 1 : 0)
          db.contributedFields += fieldsSubmitted
          return { fieldsSubmitted, contributedFields: db.contributedFields }
        }),
    }),

  getEmployerDashboard: () => request('/employer/dashboard', { mock: employerMock }),

  resolveDecision: (id: string, value: string) =>
    request(`/employer/decisions/${id}`, {
      method: 'PUT',
      body: { value },
      mock: () =>
        updateDb((db) => {
          db.resolvedDecisions = { ...db.resolvedDecisions, [id]: value }
          return { id, value }
        }),
    }),

  answerQuestion: (postId: string, body: string) =>
    request(`/employer/questions/${postId}/answer`, {
      method: 'POST',
      body: { body },
      mock: () =>
        updateDb((db) => {
          const employerAnswer = { author: 'Dana K. · People Ops', when: 'Answered just now', body }
          db.posts = db.posts.map((p) => (p.id === postId ? { ...p, employerAnswer } : p))
          return employerAnswer
        }),
    }),

  /** Mock only: restores the seed data so a demo can be run again from the top. */
  resetDemo: () => request('/demo/reset', { method: 'POST', mock: () => resetMockDb() }),
}
