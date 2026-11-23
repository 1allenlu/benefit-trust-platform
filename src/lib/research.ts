/**
 * Anonymous event log for the offer decision and return-use tests. No identity, no free text.
 * shortcut: browser-local only, one participant per device; POST to the API once there is a backend.
 */

export type ResearchEventName =
  | 'offer_opened'
  | 'source_opened'
  | 'question_asked'
  | 'question_saved'
  | 'offer_accepted'
  | 'start_date_corrected'
  | 'dashboard_viewed'
  | 'task_done'
  | 'task_reopened'
  | 'question_typed'
  | 'correction_submitted'
  | 'calendar_added'
  | 'reminders_opened'
  | 'contribution_set'

export type ResearchEvent = { at: string; name: ResearchEventName; detail?: string }

const KEY = 'vested.research.v1'

export function readEvents(): ResearchEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function track(name: ResearchEventName, detail?: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...readEvents(), { at: new Date().toISOString(), name, detail }]))
  } catch {
    // Logging must never break the flow.
  }
}

export function clearEvents() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** Local calendar day, so "returned on a later day" matches the participant's own days. */
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-CA')

const CATEGORY_BY_SECTION: Record<string, string> = {
  'health-enrollment': 'Health',
  'paid-time-off': 'Paid time off',
  'employer-match': '401(k)',
}
const CATEGORY_BY_QUESTION: Record<string, string> = {
  health_deadline: 'Health',
  provider_network: 'Health',
  pto_days: 'Paid time off',
  retirement_match: '401(k)',
}

export function summarize(events: ResearchEvent[]) {
  // The offer decision test only counts what happened before accepting.
  const acceptedAt = events.findIndex((e) => e.name === 'offer_accepted')
  const before = acceptedAt === -1 ? events : events.slice(0, acceptedAt)
  const firstCategoryEvent = before.find((e) => e.name === 'source_opened' || e.name === 'question_asked')
  const firstCategory = firstCategoryEvent
    ? (firstCategoryEvent.name === 'source_opened' ? CATEGORY_BY_SECTION : CATEGORY_BY_QUESTION)[firstCategoryEvent.detail ?? '']
    : undefined

  const firstDay = events.length ? dayOf(events[0].at) : undefined
  const laterDays = events.filter((e) => firstDay && dayOf(e.at) > firstDay)

  return {
    offerDecision: {
      firstCategory: firstCategory ?? null,
      foundDeadline: before.some((e) => (e.name === 'question_asked' && e.detail === 'health_deadline') || (e.name === 'source_opened' && e.detail === 'health-enrollment')),
      openedSupport: before.some((e) => e.name === 'source_opened'),
      savedHrQuestion: events.some((e) => e.name === 'question_saved'),
      accepted: events.some((e) => e.name === 'offer_accepted'),
    },
    returnUse: {
      daysActive: new Set(events.map((e) => dayOf(e.at))).size,
      returnedLaterDay: laterDays.some((e) => e.name === 'dashboard_viewed'),
      actedLaterDay: laterDays.some((e) => e.name === 'task_done' || e.name === 'task_reopened' || e.name === 'start_date_corrected'),
    },
  }
}

export function eventsCsv(events: ResearchEvent[]) {
  return ['at,event,detail', ...events.map((e) => `${e.at},${e.name},${e.detail ?? ''}`)].join('\n')
}
