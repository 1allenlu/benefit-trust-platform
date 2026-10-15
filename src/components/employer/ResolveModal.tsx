import { useState } from 'react'
import type { EmployerDecision } from '../../data/mock'
import { Button } from '../Button'
import { fieldClass } from '../fieldClass'
import { Modal } from '../Modal'

type ResolveModalProps = {
  decision: EmployerDecision
  remaining: number
  onResolve: (value: string) => Promise<void>
  onClose: () => void
}

/** Resolve one blocker: pick the correct version, add a missing figure, or replace a source. */
export function ResolveModal({ decision, remaining, onResolve, onClose }: ResolveModalProps) {
  const { resolve } = decision
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    await onResolve(value)
  }

  return (
    <Modal title={decision.title} subtitle={remaining > 1 ? `${remaining} decisions left` : 'Last decision'} onClose={onClose} width={500}>
      <p className="text-body font-medium text-ink">{resolve.prompt}</p>

      {resolve.type === 'choose' && (
        <fieldset className="flex flex-col gap-[8px]">
          <legend className="sr-only">{resolve.prompt}</legend>
          {resolve.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-[10px] rounded-[8px] border px-[12px] py-[10px] ${
                value === option ? 'border-teal-900 bg-teal-100' : 'border-line hover:bg-soft'
              }`}
            >
              <input type="radio" name="resolve" value={option} checked={value === option} onChange={() => setValue(option)} className="accent-teal-900" />
              <span className="text-body text-ink">{option}</span>
            </label>
          ))}
          <p className="text-small text-light">The other version is retired with today's date; employees see the change logged.</p>
        </fieldset>
      )}

      {resolve.type === 'amount' && (
        <label className="relative flex items-center">
          <span className="pointer-events-none absolute left-[12px] text-body text-light">$</span>
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="750"
            aria-label={resolve.prompt}
            className={`${fieldClass} pl-[24px]`}
          />
        </label>
      )}

      {resolve.type === 'upload' && (
        <label className="flex cursor-pointer flex-col gap-[2px] rounded-[8px] border-2 border-dashed border-line-strong px-[14px] py-[14px] hover:bg-softer">
          <input type="file" accept=".pdf" className="sr-only" onChange={(e) => setValue(e.target.files?.[0]?.name ?? '')} />
          <span className="text-body font-medium text-ink">{value || 'Choose the 2026 Benefits Guide (PDF)'}</span>
          <span className="text-small text-light">{value ? 'Ready — 14 fields will be re-checked against it' : 'We re-check every field that cites the old guide.'}</span>
        </label>
      )}

      <div className="flex gap-[8px]">
        <Button kind="dark" onClick={submit} disabled={!value || saving} className="disabled:opacity-50">
          {saving ? 'Publishing…' : 'Publish'}
        </Button>
        <Button kind="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
