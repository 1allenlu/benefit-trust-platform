import { useState } from 'react'
import { contentApi } from '../api'
import type { OfferCorrection } from '../api/mock/db'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Loaded } from '../components/Loaded'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { useToast } from '../components/Toast'
import { sampleOffer, sectionById } from '../data/offer'
import { useApi } from '../hooks/useApi'

/** Internal review queue for packet corrections. Not linked from the nav. */
export function ReviewPage() {
  const state = useApi(() => contentApi.getOffer(), [])
  return (
    <PageShell activeTab="">
      <Loaded state={state}>{(data) => <Queue initial={data.corrections} />}</Loaded>
    </PageShell>
  )
}

function Queue({ initial }: { initial: OfferCorrection[] }) {
  const toast = useToast()
  const [corrections, setCorrections] = useState(initial)
  const pending = corrections.filter((c) => c.status === 'pending')
  const reviewed = corrections.filter((c) => c.status !== 'pending')

  const decide = async (c: OfferCorrection, status: 'accepted' | 'rejected') => {
    setCorrections((await contentApi.reviewCorrection(c.id, status)).corrections)
    toast(status === 'accepted' ? 'Accepted for the next packet version' : 'Not accepted', 'info')
  }

  const row = (c: OfferCorrection) => {
    const section = sectionById(c.sectionId)
    return (
      <li key={c.id} className="flex flex-col gap-[8px] border-b border-line py-[14px] last:border-b-0">
        <div className="flex items-center gap-[10px]">
          <span className="flex-1 text-small font-semibold text-mid">
            §{section.number} {section.title} · submitted {new Date(c.submittedAt).toLocaleString()}
          </span>
          {c.status === 'pending' ? (
            <>
              <Button kind="primary" onClick={() => decide(c, 'accepted')}>
                Accept
              </Button>
              <Button onClick={() => decide(c, 'rejected')}>Reject</Button>
            </>
          ) : (
            <Chip label={c.status === 'accepted' ? 'Accepted · next version' : 'Not accepted'} tone={c.status === 'accepted' ? 'verified' : 'muted'} />
          )}
        </div>
        <p className="text-small text-light">Packet says: “{section.text}”</p>
        <p className="text-body text-ink">Suggested: “{c.proposed}”</p>
        <p className="text-small text-mid">Source given: {c.source || 'none'}</p>
      </li>
    )
  }

  return (
    <>
      <SectionHeader
        title="Correction review"
        subtitle={`${sampleOffer.packetTitle} v${sampleOffer.planVersion}. Accepting queues a change for the next version; the published packet never changes in place.`}
      />
      <Panel className="w-full gap-[4px]">
        <SectionHeader title="Waiting for review" subtitle={`${pending.length} pending`} />
        {pending.length ? <ul className="flex flex-col">{pending.map(row)}</ul> : <p className="py-[8px] text-small text-light">Nothing waiting.</p>}
      </Panel>
      {reviewed.length > 0 && (
        <Panel className="w-full gap-[4px]">
          <SectionHeader title="Reviewed" />
          <ul className="flex flex-col">{reviewed.map(row)}</ul>
        </Panel>
      )}
    </>
  )
}
