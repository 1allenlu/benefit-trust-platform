import { offerQuestions, planRules, type OfferQuestion, type PacketSectionId, type PlanRule } from '../data/offer.ts'

export type OfferState = {
  offerId: string
  planVersion: string
  status: 'prospective' | 'accepted'
  /** YYYY-MM-DD, set when accepted. */
  startDate: string | null
  savedQuestionIds: string[]
  /** Questions typed by the user that the packet couldn't answer, saved for HR. */
  customQuestions: { id: string; text: string }[]
  /** Completion by stable task ID, so it survives start-date corrections. */
  doneTaskIds: string[]
  /** What the user says they contribute to the 401(k), % of pay. */
  contributionPercent: number | null
}

export type OfferTask = {
  id: string
  title: string
  why: string
  /** YYYY-MM-DD, or null when the plan gives no date. */
  due: string | null
  /** Shown when `due` is null: "Any time" for known no-deadline rules, else "Check with HR". */
  undatedLabel: string
  sectionId?: PacketSectionId
  done: boolean
}

export type OfferMilestone = { id: string; title: string; why: string; date: string | null; sectionId: PacketSectionId }

export type Reminder = { id: string; title: string; detail: string }

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

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (date: string) => longDate.format(new Date(`${date}T00:00:00Z`))

/** The user's own calendar day, for "due in N days". */
export const localToday = () => new Date().toLocaleDateString('en-CA')

export function ruleDate(rule: PlanRule, startDate: string | null) {
  if (!startDate || !rule.when) return null
  if ('daysAfterStart' in rule.when) return addCalendarDays(startDate, rule.when.daysAfterStart)
  const [y, m] = startDate.split('-').map(Number)
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10) // month index m = the month after
}

const HR_WHY = 'The offer packet does not answer this.'

/** Tasks are derived, never stored, so reopening the flow can't duplicate them. */
export function buildTasks(state: OfferState): OfferTask[] {
  if (state.status !== 'accepted') return []
  const ruleTasks = planRules
    .filter((r) => r.kind === 'task')
    .map((r) => ({ id: r.id, title: r.title, why: r.why, due: ruleDate(r, state.startDate), undatedLabel: r.undatedLabel ?? 'Check with HR', sectionId: r.sectionId }))
  const questionTasks = [
    ...offerQuestions.filter((q) => state.savedQuestionIds.includes(q.id)).map((q) => ({ id: `hr-${q.id}`, text: q.label })),
    ...state.customQuestions.map((q) => ({ id: `hr-${q.id}`, text: q.text })),
  ].map((q) => ({ id: q.id, title: `Ask HR: ${q.text}`, why: HR_WHY, due: null, undatedLabel: 'Check with HR' }))
  return [...ruleTasks, ...questionTasks].map((t) => ({ ...t, done: state.doneTaskIds.includes(t.id) }))
}

/** Dates a benefit becomes usable. */
export function buildMilestones(state: OfferState): OfferMilestone[] {
  if (state.status !== 'accepted') return []
  return planRules
    .filter((r) => r.kind === 'available')
    .map((r) => ({ id: r.id, title: r.title, why: r.why, date: ruleDate(r, state.startDate), sectionId: r.sectionId }))
}

/** The reasons to come back: a deadline near or past, an open HR question, a benefit about to or just become usable. */
export function buildReminders(tasks: OfferTask[], milestones: OfferMilestone[], today: string): Reminder[] {
  const reminders: Reminder[] = []
  for (const t of tasks) {
    if (t.done) continue
    if (t.due) {
      const days = daysBetween(today, t.due)
      if (days < 0) reminders.push({ id: t.id, title: `Overdue: ${t.title}`, detail: `Was due ${formatDate(t.due)}` })
      else if (days <= 14) reminders.push({ id: t.id, title: t.title, detail: days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}, ${formatDate(t.due)}` })
    } else if (t.id.startsWith('hr-')) {
      reminders.push({ id: t.id, title: 'Still open for HR', detail: t.title.replace('Ask HR: ', '') })
    }
  }
  for (const m of milestones) {
    if (!m.date) continue
    const days = daysBetween(today, m.date)
    if (days >= -14 && days <= 0) reminders.push({ id: m.id, title: `Now available: ${m.title.replace(/ (starts|becomes usable)$/, '')}`, detail: `Since ${formatDate(m.date)}` })
    else if (days > 0 && days <= 7) reminders.push({ id: m.id, title: `Coming up: ${m.title}`, detail: formatDate(m.date) })
  }
  return reminders
}

/** Free-text lookup against the packet's supported questions. Never guesses: no match returns undefined. */
export function matchQuestion(text: string): OfferQuestion | undefined {
  const t = text.toLowerCase()
  return offerQuestions.find((q) => q.match.every((group) => group.some((word) => t.includes(word))))
}

const icsText = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')

/** All-day calendar event with a reminder three days before. */
export function icsFor(task: { id: string; title: string; due: string; why: string }, now = new Date()) {
  const day = (d: string) => d.replaceAll('-', '')
  const stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vested//Offer tracker//EN',
    'BEGIN:VEVENT',
    `UID:${task.id}@vested-demo`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day(task.due)}`,
    `DTEND;VALUE=DATE:${day(addCalendarDays(task.due, 1))}`,
    `SUMMARY:${icsText(task.title)}`,
    `DESCRIPTION:${icsText(task.why)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(task.title)}`,
    'TRIGGER:-P3D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
