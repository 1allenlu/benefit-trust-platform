// Self-check for the offer logic and fixture consistency. Run: node src/lib/offer.check.ts
import { offerMatchTiers, offerQuestions, packetSections, sectionById } from '../data/offer.ts'
import {
  addCalendarDays,
  buildMilestones,
  buildReminders,
  buildTasks,
  icsFor,
  isValidDate,
  matchQuestion,
  type OfferState,
} from './offer.ts'

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
  customQuestions: [{ id: 'q1', text: 'Is dental included?' }],
  doneTaskIds: ['elect-health-coverage'],
  contributionPercent: null,
}
const tasks = buildTasks(state)
eq(
  tasks.map((t) => [t.id, t.due, t.undatedLabel, t.done]),
  [
    ['elect-health-coverage', '2027-01-06', 'Check with HR', true],
    ['enroll-401k', null, 'Any time', false],
    ['hr-provider_network', null, 'Check with HR', false],
    ['hr-q1', null, 'Check with HR', false],
  ],
  'tasks',
)
// Correcting the start date moves the due date but keeps completion.
eq(buildTasks({ ...state, startDate: '2027-01-04' })[0], { ...tasks[0], due: '2027-02-03' }, 'start date correction')
eq(buildTasks({ ...state, status: 'prospective' }), [], 'no tasks before acceptance')

const milestones = buildMilestones(state)
eq(milestones.map((m) => [m.id, m.date]), [['health-coverage-starts', '2027-01-01'], ['pto-usable', '2027-03-07']], 'milestones')
eq(buildMilestones({ ...state, startDate: '2026-12-01' })[0].date, '2027-01-01', 'first of month after a 1st start')

// Reminders: open deadline within 14 days, open HR questions, benefit just usable.
const open = buildTasks({ ...state, doneTaskIds: [] })
eq(buildReminders(open, milestones, '2026-12-30').map((r) => r.title), [
  'Elect health coverage',
  'Still open for HR',
  'Still open for HR',
  'Coming up: Health coverage starts',
], 'reminders before deadline')
eq(buildReminders(open, milestones, '2027-01-08').map((r) => r.title).slice(0, 1), ['Overdue: Elect health coverage'], 'overdue')
eq(buildReminders(tasks, milestones, '2027-01-02').map((r) => r.title).at(-1), 'Now available: Health coverage', 'now available')

// Free-text matching routes to the specific question, and never guesses.
eq(matchQuestion('when do i need to enroll in health coverage?')?.id, 'health_deadline', 'chip text matches itself')
for (const q of offerQuestions) eq(matchQuestion(q.label)?.id, q.id, `label routes to itself: ${q.id}`)
eq(matchQuestion('When does my medical insurance kick in?')?.id, 'coverage_start', 'coverage start')
eq(matchQuestion('how many vacation days')?.id, 'pto_days', 'pto days')
eq(matchQuestion('Is dental included?'), undefined, 'unsupported → no match')

// Every answer that cites a clause must quote that clause's facts (numbers agree).
for (const q of offerQuestions) {
  if (!q.sectionId) continue
  const nums = (s: string) => s.match(/\d+%?/g) ?? []
  eq(nums(q.answer), nums(sectionById(q.sectionId).text), `answer numbers match clause: ${q.id}`)
}
eq(new Set(packetSections.map((s) => s.id)).size, packetSections.length, 'section ids unique')

// The calculator's rule must say what the packet clause says.
const clause = sectionById('employer-match').text
for (const t of offerMatchTiers) {
  eq(clause.includes(`${t.rate * 100}% of employee contributions up to ${t.upTo}%`), true, 'match rule matches §4.2')
}

const ics = icsFor({ id: 'elect-health-coverage', title: 'Elect health coverage', due: '2027-01-06', why: 'a, b; c' }, new Date('2026-12-01T10:00:00Z'))
eq(ics.includes('DTSTART;VALUE=DATE:20270106') && ics.includes('DTEND;VALUE=DATE:20270107') && ics.includes('DESCRIPTION:a\\, b\\; c'), true, 'ics')

console.log('offer checks passed')
