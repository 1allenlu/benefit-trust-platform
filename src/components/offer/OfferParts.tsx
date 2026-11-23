import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../api'
import { benefitCards, sampleOffer, sectionById, type PacketSectionId } from '../../data/offer'
import { isValidDate } from '../../lib/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Chip } from '../Chip'
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

/** Health, PTO and 401(k) in one card pattern: key term, source link, unknowns. */
export function OfferBenefitCards() {
  return (
    <div className="grid w-full grid-cols-3 gap-[14px]">
      {benefitCards.map((card) => (
        <section key={card.category} className="flex flex-col gap-[10px] rounded-[12px] border border-line bg-surface px-[18px] pt-[16px] pb-[18px]">
          <span className="text-cap font-semibold text-light uppercase">{card.category}</span>
          <p className="text-body font-medium text-ink">{card.term}</p>
          <SourceLink sectionId={card.sectionId} />
          {card.unknowns.length > 0 && (
            <div className="flex flex-wrap items-center gap-[6px]">
              <span className="text-small text-light">Not in packet:</span>
              {card.unknowns.map((u) => (
                <Chip key={u} label={u} tone="muted" />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
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
