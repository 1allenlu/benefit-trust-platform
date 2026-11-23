// Known/unknown answer check for the live assistant, run before turning it on (doc: "after checking
// known and unknown answers on each supported plan"). Calls the real API and costs a few cents.
// Run: npm run eval:ask   (needs ANTHROPIC_API_KEY in .env)
import Anthropic from '@anthropic-ai/sdk'
import { askPacket } from '../server/askPacket.js'
import { offerQuestions, type PacketSectionId } from '../src/data/offer.js'

const known = offerQuestions
  .filter((q) => q.sectionId)
  .map((q) => ({ question: q.label, expect: q.sectionId as PacketSectionId | null }))

const unknown = [
  'Is my doctor in network?',
  'Is dental included?',
  'How much are the health premiums?',
  'How long until the 401(k) match vests?',
  'Can I carry over unused PTO?',
  'Is there a signing bonus?',
  'Do I get parental leave?',
].map((question) => ({ question, expect: null }))

const client = new Anthropic()
let passed = 0
const cases = [...known, ...unknown]
for (const c of cases) {
  const got = await askPacket(client, c.question)
  const ok = got.sectionId === c.expect
  if (ok) passed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.question}\n      → [${got.sectionId ?? 'unsupported'}] ${got.answer}`)
}
console.log(`\n${passed}/${cases.length} correct or appropriately unavailable`)
process.exitCode = passed === cases.length ? 0 : 1
