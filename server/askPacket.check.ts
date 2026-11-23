// Self-check for the server-side answer guard (no API calls). Run: npm run check
import { UNSUPPORTED, verify } from './askPacket.js'

function eq(actual: unknown, expected: unknown, what: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`)
}

const ok = { answer: 'You have 30 calendar days after your start date to elect coverage (§2.1).', section_id: 'health-enrollment' }
eq(verify(ok), { answer: ok.answer, sectionId: 'health-enrollment' }, 'supported answer passes')
eq(verify({ ...ok, answer: 'You have 45 days to elect coverage.' }), UNSUPPORTED, 'invented number is blocked')
eq(verify({ ...ok, section_id: 'dental-plan' }), UNSUPPORTED, 'made-up section is blocked')
eq(verify({ answer: "The packet doesn't cover dental.", section_id: null }), { answer: "The packet doesn't cover dental.", sectionId: null }, 'honest unknown passes')
eq(verify({ answer: '', section_id: null }), UNSUPPORTED, 'empty answer')
eq(verify('nonsense'), UNSUPPORTED, 'not an object')
eq(verify({ answer: 'Matches 100% up to 3% of eligible pay.', section_id: 'employer-match' }).sectionId, 'employer-match', 'percent numbers allowed')

eq(verify({ answer: 'You can enroll in the 401(k) any time (§4.1).', section_id: 'retirement-enrollment' }).sectionId, 'retirement-enrollment', '401(k) and citation allowed')
eq(verify({ answer: 'You get 20 days off (§3.1).', section_id: 'paid-time-off' }), UNSUPPORTED, 'wrong PTO number blocked despite citation')
eq(verify({ answer: 'Dental is covered at 80%.', section_id: null }), UNSUPPORTED, 'uncited answer stating a figure is blocked')

console.log('askPacket checks passed')
