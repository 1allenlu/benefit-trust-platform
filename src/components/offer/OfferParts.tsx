import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../api'
import type { OfferCorrection } from '../../api/mock/db'
import { benefitCards, sampleOffer, sectionById, type BenefitCard, type PacketSectionId } from '../../data/offer'
import { isValidDate } from '../../lib/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Chip, type ChipTone } from '../Chip'
import { SelectField, TextAreaField } from '../FormControls'
import { Modal } from '../Modal'
import { FormError } from '../auth/FormError'
import { TextField } from '../auth/TextField'

export const offerPath = `/offers/${sampleOffer.id}`

/** Opens the exact packet clause. A plain link, so the same URL works from any page. */
export function SourceLink({ sectionId, label }: { sectionId: PacketSectionId; label?: string }) {
  const section = sectionById(sectionId)
  return (
    <Link to={`${offerPath}#${sectionId}`} onClick={() => track('source_opened', sectionId)} className="text-small font-medium text-t-link hover:underline">
      {label ?? `Source: §${section.number} ${section.title}`}
    </Link>
  )
}

const correctionChip: Record<OfferCorrection['status'], { label: string; tone: ChipTone }> = {
  pending: { label: 'Correction pending review', tone: 'flag' },
  accepted: { label: 'Correction accepted · next packet version', tone: 'verified' },
  rejected: { label: 'Correction not accepted', tone: 'muted' },
}

/** Health, PTO and 401(k) in one card pattern: key term, source link, unknowns, correction status. */
export function OfferBenefitCards({ corrections = [], onCorrect }: { corrections?: OfferCorrection[]; onCorrect?: (card: BenefitCard) => void }) {
  return (
    <div className="grid w-full grid-cols-3 gap-[14px]">
      {benefitCards.map((card) => {
        const latest = corrections.filter((c) => c.sectionId === card.sectionId || c.sectionId === card.more.sectionId).at(-1)
        return (
        <section key={card.category} className="flex flex-col gap-[10px] rounded-[12px] border border-line bg-surface px-[18px] pt-[16px] pb-[18px]">
          <div className="flex items-center gap-[8px]">
            <span className="flex-1 text-cap font-semibold text-light uppercase">{card.category}</span>
            {onCorrect && (
              <button type="button" onClick={() => onCorrect(card)} className="cursor-pointer text-small font-medium text-t-link hover:underline">
                Suggest a correction
              </button>
            )}
          </div>
          <p className="text-body font-medium text-ink">{card.term}</p>
          <SourceLink sectionId={card.sectionId} />
          <p className="text-small text-mid">{card.more.text}</p>
          <SourceLink sectionId={card.more.sectionId} />
          {latest && (
            <div>
              <Chip {...correctionChip[latest.status]} />
            </div>
          )}
          {card.unknowns.length > 0 && (
            <div className="flex flex-wrap items-center gap-[6px]">
              <span className="text-small text-light">Not in packet:</span>
              {card.unknowns.map((u) => (
                <Chip key={u} label={u} tone="muted" />
              ))}
            </div>
          )}
        </section>
        )
      })}
    </div>
  )
}

/** Field-level correction to the packet. Goes to a review queue; nothing on the page changes until a reviewer accepts it. */
export function CorrectionModal({ card, onClose, onSubmit }: { card: BenefitCard; onClose: () => void; onSubmit: (input: { sectionId: PacketSectionId; proposed: string; source: string }) => Promise<void> }) {
  const [sectionId, setSectionId] = useState<PacketSectionId>(card.sectionId)
  const [proposed, setProposed] = useState('')
  const [source, setSource] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!proposed.trim()) return setError('Say what it should be')
    setBusy(true)
    try {
      await onSubmit({ sectionId, proposed, source })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit. Try again.')
      setBusy(false)
    }
  }

  const fields = [card.sectionId, card.more.sectionId].map(sectionById)
  return (
    <Modal title={`Suggest a correction · ${card.category}`} subtitle="A reviewer checks it against the plan document before anything changes." onClose={onClose} width={520}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-[14px]">
        <SelectField
          label="Which clause?"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value as PacketSectionId)}
          options={fields.map((f) => ({ value: f.id, label: `§${f.number} ${f.title}` }))}
        />
        <p className="rounded-[8px] bg-soft px-[12px] py-[10px] text-small text-mid">Currently: “{sectionById(sectionId).text}”</p>
        <TextAreaField label="What should it say?" value={proposed} maxLength={500} onChange={(e) => setProposed(e.target.value)} />
        <TextAreaField label="Where did you see this? (optional)" rows={2} value={source} maxLength={500} onChange={(e) => setSource(e.target.value)} hint="e.g. page and section of your plan document" />
        {error && <FormError message={error} />}
        <div className="flex gap-[8px]">
          <Button kind="primary" type="submit" disabled={busy}>
            Submit for review
          </Button>
          <Button kind="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/** Collects a valid start date. Used both to accept and to correct the date later. */
export function StartDateForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: string
  submitLabel: string
  onSubmit: (startDate: string) => Promise<void>
}) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidDate(value)) return setError('Enter a valid start date')
    setError(undefined)
    setBusy(true)
    try {
      await onSubmit(value)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[12px]">
      <TextField label="Start date" type="date" required value={value} onChange={(e) => setValue(e.target.value)} error={error} />
      <Button kind="primary" type="submit" disabled={busy} className="self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
