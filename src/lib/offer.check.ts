// Self-check for the offer task logic. Run: node src/lib/offer.check.ts
import { offerMatchTiers, sectionById } from '../data/offer.ts'
import { addCalendarDays, buildTasks, isValidDate, type OfferState } from './offer.ts'

function eq(actual: unknown, expected: unknown, what: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`)
}

eq(addCalendarDays('2026-12-07', 30), '2027-01-06', 'acceptance example')
eq(addCalendarDays('2026-03-01', 30), '2026-03-31', 'across US DST change')
eq(addCalendarDays('2028-02-01', 30), '2028-03-02', 'leap year')
eq(isValidDate('2026-02-30'), false, 'impossible date')
eq(isValidDate('2026-12-07'), true, 'valid date')
eq(isValidDate(''), false, 'empty')

const state: OfferState = {
  offerId: 'o',
  planVersion: 'v',
  status: 'accepted',
  startDate: '2026-12-07',
  savedQuestionIds: ['provider_network'],
  doneTaskIds: ['elect-health-coverage'],
}
const tasks = buildTasks(state)
eq(tasks.map((t) => [t.id, t.due, t.done]), [['elect-health-coverage', '2027-01-06', true], ['hr-provider_network', null, false]], 'tasks')
// Correcting the start date moves the due date but keeps completion.
eq(buildTasks({ ...state, startDate: '2027-01-04' })[0], { ...tasks[0], due: '2027-02-03' }, 'start date correction')
eq(buildTasks({ ...state, status: 'prospective' }), [], 'no tasks before acceptance')

// The calculator's rule must say what the packet clause says.
const clause = sectionById('employer-match').text
for (const t of offerMatchTiers) {
  eq(clause.includes(`${t.rate * 100}% of employee contributions up to ${t.upTo}%`), true, 'match rule matches §4.2')
}

console.log('offer checks passed')
