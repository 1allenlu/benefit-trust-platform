import { useState } from 'react'
import { offerQuestions, type OfferQuestion } from '../../data/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import { SourceLink } from './OfferParts'

type Props = {
  savedQuestionIds: string[]
  onSave: (questionId: string) => Promise<void>
}

/** P0 scripted chat: each chip maps to a fixed reply and source. No model call. */
export function OfferAssistant({ savedQuestionIds, onSave }: Props) {
  const [asked, setAsked] = useState<OfferQuestion[]>([])
  const [saving, setSaving] = useState(false)

  const save = async (id: string) => {
    setSaving(true)
    try {
      await onSave(id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="min-w-0 flex-1 gap-[14px]">
      <SectionHeader title="Ask about this offer" subtitle="Demo assistant · sample responses" />
      <div className="flex flex-wrap gap-[8px]">
        {offerQuestions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              track('question_asked', q.id)
              setAsked((list) => [...list, q])
            }}
            className="cursor-pointer rounded-full border border-line-strong bg-surface px-[12px] py-[6px] text-small font-medium text-ink hover:bg-soft"
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-[10px]" aria-live="polite">
        {asked.length === 0 && <p className="text-small text-light">Pick a question. Answers come only from the offer packet.</p>}
        {asked.map((q, i) => {
          const saved = savedQuestionIds.includes(q.id)
          return (
            <div key={i} className="flex flex-col gap-[8px]">
              <p className="max-w-[80%] self-end rounded-[12px] rounded-br-[4px] bg-teal-900 px-[14px] py-[9px] text-body text-on-dark">
                {q.label}
              </p>
              <div className="flex max-w-[85%] flex-col gap-[8px] self-start rounded-[12px] rounded-bl-[4px] bg-soft px-[14px] py-[10px]">
                <p className="text-body text-ink">{q.answer}</p>
                {q.sectionId ? (
                  <SourceLink sectionId={q.sectionId} label="View source" />
                ) : saved ? (
                  <p className="text-small font-medium text-t-green">Saved to My benefits</p>
                ) : (
                  <Button kind="secondary" disabled={saving} onClick={() => save(q.id)} className="self-start">
                    Save question for HR
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
