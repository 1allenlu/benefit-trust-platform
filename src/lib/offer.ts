import { offerQuestions, planRules, type PacketSectionId } from '../data/offer.ts'

export type OfferState = {
  offerId: string
  planVersion: string
  status: 'prospective' | 'accepted'
  /** YYYY-MM-DD, set when accepted. */
  startDate: string | null
  savedQuestionIds: string[]
  /** Completion by stable task ID, so it survives start-date corrections. */
  doneTaskIds: string[]
}

export type OfferTask = {
  id: string
  title: string
  why: string
  /** YYYY-MM-DD, or null for "Check with HR". */
  due: string | null
  sectionId?: PacketSectionId
  done: boolean
}

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === value
}

/** Calendar-day arithmetic in UTC, so DST and time zones can't shift the result. */
export function addCalendarDays(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (date: string) => longDate.format(new Date(`${date}T00:00:00Z`))

/** Tasks are derived, never stored, so reopening the flow can't duplicate them. */
export function buildTasks(state: OfferState): OfferTask[] {
  if (state.status !== 'accepted') return []
  const ruleTasks = planRules.map((rule) => ({
    id: rule.taskId,
    title: rule.title,
    why: rule.why,
    due: state.startDate ? addCalendarDays(state.startDate, rule.daysAfterStart) : null,
    sectionId: rule.sectionId,
  }))
  const questionTasks = offerQuestions
    .filter((q) => state.savedQuestionIds.includes(q.id))
    .map((q) => ({ id: `hr-${q.id}`, title: `Ask HR: ${q.label}`, why: 'The offer packet does not answer this.', due: null }))
  return [...ruleTasks, ...questionTasks].map((t) => ({ ...t, done: state.doneTaskIds.includes(t.id) }))
}
