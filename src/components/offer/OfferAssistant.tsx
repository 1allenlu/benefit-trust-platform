import { useState, type FormEvent } from 'react'
import { offerQuestions, type OfferQuestion, type PacketSectionId } from '../../data/offer'
import { matchQuestion } from '../../lib/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import { fieldClass } from '../fieldClass'
import { SourceLink } from './OfferParts'

/** One answer from the live model, already checked server-side against the packet. */
export type LiveAnswer = { answer: string; sectionId: PacketSectionId | null }

type Message =
  | { kind: 'scripted'; text: string; question: OfferQuestion }
  | { kind: 'live'; text: string; reply: LiveAnswer }
  | { kind: 'unmatched'; text: string }

type Props = {
  savedQuestionIds: string[]
  savedCustomTexts: string[]
  onSave: (questionId: string) => Promise<void>
  onSaveCustom: (text: string) => Promise<void>
  /** P1 live model; when absent or it returns null, unmatched questions get the fixed fallback. */
  askLive?: (text: string) => Promise<LiveAnswer | null>
}

const FALLBACK = 'Try one of the sample questions above.'

/** Chips map to fixed replies; typed questions go through the same lookup, then the live model if enabled. */
export function OfferAssistant({ savedQuestionIds, savedCustomTexts, onSave, onSaveCustom, askLive }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const askChip = (q: OfferQuestion) => {
    track('question_asked', q.id)
    setMessages((list) => [...list, { kind: 'scripted', text: q.label, question: q }])
  }

  const askTyped = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    const q = matchQuestion(text)
    track('question_typed', q?.id ?? 'unmatched')
    if (q) return setMessages((list) => [...list, { kind: 'scripted', text, question: q }])
    if (!askLive) return setMessages((list) => [...list, { kind: 'unmatched', text }])
    run(async () => {
      const reply = await askLive(text).catch(() => null)
      setMessages((list) => [...list, reply ? { kind: 'live', text, reply } : { kind: 'unmatched', text }])
    })
  }

  return (
    <Panel className="min-w-0 flex-1 gap-[14px]">
      <SectionHeader title="Ask about this offer" subtitle={askLive ? 'Demo assistant · sample responses, plus live answers from the packet' : 'Demo assistant · sample responses'} />
      <div className="flex flex-wrap gap-[8px]">
        {offerQuestions
          .filter((q) => q.chip)
          .map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => askChip(q)}
              className="cursor-pointer rounded-full border border-line-strong bg-surface px-[12px] py-[6px] text-small font-medium text-ink hover:bg-soft"
            >
              {q.label}
            </button>
          ))}
      </div>
      <div className="flex flex-col gap-[10px]" aria-live="polite">
        {messages.length === 0 && <p className="text-small text-light">Pick a question or type one. Answers come only from the offer packet.</p>}
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-[8px]">
            <p className="max-w-[80%] self-end rounded-[12px] rounded-br-[4px] bg-teal-900 px-[14px] py-[9px] text-body text-on-dark">{m.text}</p>
            <div className="flex max-w-[85%] flex-col gap-[8px] self-start rounded-[12px] rounded-bl-[4px] bg-soft px-[14px] py-[10px]">
              {m.kind === 'unmatched' && <p className="text-body text-ink">{FALLBACK}</p>}
              {m.kind === 'scripted' && (
                <>
                  <p className="text-body text-ink">{m.question.answer}</p>
                  {m.question.sectionId ? (
                    <SourceLink sectionId={m.question.sectionId} label="View source" />
                  ) : (
                    <SaveForHr saved={savedQuestionIds.includes(m.question.id)} busy={busy} onSave={() => run(() => onSave(m.question.id))} />
                  )}
                </>
              )}
              {m.kind === 'live' && (
                <>
                  <p className="text-body text-ink">{m.reply.answer}</p>
                  {m.reply.sectionId ? (
                    <SourceLink sectionId={m.reply.sectionId} label="View source" />
                  ) : (
                    <SaveForHr
                      saved={savedCustomTexts.some((t) => t.toLowerCase() === m.text.toLowerCase())}
                      busy={busy}
                      onSave={() => run(() => onSaveCustom(m.text))}
                    />
                  )}
                  <p className="text-cap text-light uppercase">Live answer · checked against packet</p>
                </>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-small text-light">Checking the packet…</p>}
      </div>
      <form onSubmit={askTyped} className="flex gap-[8px]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={300}
          placeholder="Ask about this offer…"
          aria-label="Ask about this offer"
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <Button type="submit" disabled={!draft.trim() || busy}>
          Ask
        </Button>
      </form>
    </Panel>
  )
}

function SaveForHr({ saved, busy, onSave }: { saved: boolean; busy: boolean; onSave: () => void }) {
  return saved ? (
    <p className="text-small font-medium text-t-green">Saved to My benefits</p>
  ) : (
    <Button kind="secondary" disabled={busy} onClick={onSave} className="self-start">
      Save question for HR
    </Button>
  )
}
