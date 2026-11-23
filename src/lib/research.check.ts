// Self-check for the research summary. Run: node src/lib/research.check.ts
import { summarize, type ResearchEvent } from './research.ts'

function eq(actual: unknown, expected: unknown, what: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`)
}

// Noon UTC keeps each event on the same local day in any US time zone.
const ev = (day: string, name: ResearchEvent['name'], detail?: string): ResearchEvent => ({ at: `${day}T12:00:00Z`, name, detail })

const session = [
  ev('2026-12-01', 'offer_opened'),
  ev('2026-12-01', 'question_asked', 'pto_days'),
  ev('2026-12-01', 'source_opened', 'health-enrollment'),
  ev('2026-12-01', 'question_saved', 'provider_network'),
  ev('2026-12-01', 'offer_accepted'),
  ev('2026-12-01', 'dashboard_viewed'),
  ev('2026-12-03', 'dashboard_viewed'),
  ev('2026-12-03', 'task_done', 'elect-health-coverage'),
]
eq(summarize(session), {
  offerDecision: { firstCategory: 'Paid time off', foundDeadline: true, openedSupport: true, savedHrQuestion: true, accepted: true },
  returnUse: { daysActive: 2, returnedLaterDay: true, actedLaterDay: true },
}, 'full session')

// Same-day only: no return. Deadline found only after accepting doesn't count.
const sameDay = [ev('2026-12-01', 'offer_accepted'), ev('2026-12-01', 'source_opened', 'health-enrollment'), ev('2026-12-01', 'task_done')]
eq(summarize(sameDay).returnUse, { daysActive: 1, returnedLaterDay: false, actedLaterDay: false }, 'same day')
eq(summarize(sameDay).offerDecision.foundDeadline, false, 'deadline after accepting')
eq(summarize([]).offerDecision.firstCategory, null, 'empty log')

console.log('research checks passed')
