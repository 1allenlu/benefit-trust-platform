/**
 * P1 live Q&A over the offer packet. The model may only answer from the packet; the server then
 * checks the citation and the numbers itself, so an unsupported answer can't reach the user.
 */
import type Anthropic from '@anthropic-ai/sdk'
import { packetSections, sampleOffer, type PacketSectionId } from '../src/data/offer.js'

export type PacketAnswer = { answer: string; sectionId: PacketSectionId | null }

export const UNSUPPORTED: PacketAnswer = {
  answer: "This offer packet doesn't answer that. You can save this question to ask HR.",
  sectionId: null,
}

const sectionIds = packetSections.map((s) => s.id)

// From the product doc's "Prompt for a future live model", plus the output contract.
const SYSTEM = `Answer the user's question using only the supplied documents for this offer and plan version. State the answer in plain language and cite the supporting document and section. If the supplied sources don't contain the answer, say what's missing and offer to save a question for HR. Never infer terms or coverage. The app computes deadlines from verified rules and the user's start date.

Do not calculate dates yourself; describe the rule instead. Keep the answer to one or two sentences.

Return section_id as the id of the single section that supports the answer, or null when the documents don't answer the question.

<document title="${sampleOffer.packetTitle}" version="${sampleOffer.planVersion}">
${packetSections.map((s) => `<section id="${s.id}" number="${s.number}" title="${s.title}">${s.text}</section>`).join('\n')}
</document>`

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    section_id: { anyOf: [{ type: 'string', enum: sectionIds }, { type: 'null' }] },
  },
  required: ['answer', 'section_id'],
  additionalProperties: false,
}

const numbers = (s: string) => s.match(/\d+(\.\d+)?/g) ?? []

/** The server-side guard: a cited answer must cite a real clause and use only that clause's numbers. */
export function verify(raw: unknown): PacketAnswer {
  if (!raw || typeof raw !== 'object') return UNSUPPORTED
  const { answer, section_id } = raw as { answer?: unknown; section_id?: unknown }
  if (typeof answer !== 'string' || !answer.trim()) return UNSUPPORTED
  const text = answer.trim().slice(0, 600)
  // Section citations ("§2.1") and "401(k)" are labels, not plan terms.
  const labels = [...packetSections.map((s) => s.number), '401']
  if (section_id === null) return numbers(text).every((n) => labels.includes(n)) ? { answer: text, sectionId: null } : UNSUPPORTED
  const section = packetSections.find((s) => s.id === section_id)
  if (!section) return UNSUPPORTED
  const allowed = new Set([...numbers(section.text), ...labels])
  if (!numbers(text).every((n) => allowed.has(n))) return UNSUPPORTED
  return { answer: text, sectionId: section.id }
}

export async function askPacket(client: Anthropic, question: string): Promise<PacketAnswer> {
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: question }],
  })
  if (response.stop_reason !== 'end_turn') return UNSUPPORTED // refusal, max_tokens, etc.
  const text = response.content.find((b) => b.type === 'text')?.text
  try {
    return verify(text ? JSON.parse(text) : null)
  } catch {
    return UNSUPPORTED
  }
}
