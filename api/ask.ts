// Vercel function: POST /api/ask { question } → { answer, sectionId }.
// shortcut: no per-user rate limit, so anyone with the URL can spend API credit; add one before
// sharing the deployed link widely, or leave ANTHROPIC_API_KEY unset to keep this off (503).
import Anthropic from '@anthropic-ai/sdk'
import { askPacket } from '../server/askPacket.js'

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

export async function POST(request: Request) {
  if (!client) return Response.json({ message: 'Live assistant is not configured' }, { status: 503 })

  const body = (await request.json().catch(() => null)) as { question?: unknown } | null
  const question = typeof body?.question === 'string' ? body.question.trim() : ''
  if (!question || question.length > 300) return Response.json({ message: 'Ask a question of 1–300 characters' }, { status: 400 })

  try {
    return Response.json(await askPacket(client, question))
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return Response.json({ message: 'Busy, try again shortly' }, { status: 429 })
    if (error instanceof Anthropic.APIError) return Response.json({ message: 'Assistant unavailable' }, { status: 502 })
    throw error
  }
}
