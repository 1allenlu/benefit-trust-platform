import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { contentApi, isMockApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Loaded } from '../components/Loaded'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { useToast } from '../components/Toast'
import { OfferAssistant } from '../components/offer/OfferAssistant'
import { OfferBenefitCards, StartDateForm } from '../components/offer/OfferParts'
import { packetSections, sampleOffer } from '../data/offer'
import { useApi } from '../hooks/useApi'
import { formatDate, type OfferState } from '../lib/offer'

export function OfferPage() {
  const { offerId } = useParams()
  const state = useApi(() => contentApi.getOffer(), [])
  if (offerId !== sampleOffer.id) return <Navigate to="/" replace />
  return (
    <PageShell activeTab="companies">
      <Loaded state={state}>{(data) => <OfferContent initial={data.state} />}</Loaded>
    </PageShell>
  )
}

function OfferContent({ initial }: { initial: OfferState }) {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [offer, setOffer] = useState(initial)
  const highlighted = location.hash.slice(1)
  const accepted = offer.status === 'accepted'

  // Every source click is a navigation (new key), so re-clicking the same clause scrolls again.
  useEffect(() => {
    if (highlighted) document.getElementById(highlighted)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlighted, location.key])

  const saveQuestion = async (id: string) => {
    setOffer((await contentApi.saveOfferQuestion(id)).state)
    toast('Saved to My benefits')
  }

  const accept = async (startDate: string) => {
    await contentApi.acceptOffer(startDate)
    if (accepted) {
      setOffer((o) => ({ ...o, startDate }))
      toast(`Start date updated to ${formatDate(startDate)}`)
    } else {
      navigate('/my-benefits')
    }
  }

  const reset = async () => {
    await contentApi.resetDemo()
    window.location.assign(`/offers/${sampleOffer.id}`)
  }

  return (
    <>
      <p className="text-small text-light">
        <Link to={`/companies/${sampleOffer.companyId}`} className="hover:text-mid">
          {sampleOffer.employer}
        </Link>{' '}
        / Your offer
      </p>

      <div className="flex w-full items-center gap-[16px]">
        <span className="size-[56px] shrink-0 rounded-[12px] bg-shade" />
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <div className="flex items-center gap-[9px]">
            <h1 className="text-h1 font-bold whitespace-nowrap text-ink">{sampleOffer.employer} offer</h1>
            <Chip label={accepted ? 'Accepted' : 'Reviewing'} tone={accepted ? 'verified' : 'teal'} />
            <Chip label={sampleOffer.label} tone="flag" />
          </div>
          <p className="text-small text-light">
            {sampleOffer.role} · Plan year {sampleOffer.planYear} · Packet v{sampleOffer.planVersion}
          </p>
        </div>
        {isMockApi && <Button onClick={reset}>Reset demo</Button>}
      </div>

      <OfferBenefitCards />

      <div className="flex w-full items-start gap-[18px]">
        <OfferAssistant savedQuestionIds={offer.savedQuestionIds} onSave={saveQuestion} />

        <Panel className="w-[360px] shrink-0 gap-[14px]">
          <div id="accept" className="scroll-mt-[96px]">
            <SectionHeader
              title={accepted ? 'You accepted this offer' : 'Accepted this offer?'}
              subtitle={
                accepted && offer.startDate
                  ? `Starting ${formatDate(offer.startDate)}. Correcting the date moves your deadlines and keeps what you've done.`
                  : 'Add your start date and Vested turns the plan rules into dated tasks.'
              }
            />
          </div>
          <StartDateForm
            initial={offer.startDate ?? ''}
            submitLabel={accepted ? 'Update start date' : 'I accepted this offer'}
            onSubmit={accept}
          />
          {accepted && (
            <Button kind="ghost" to="/my-benefits" className="self-start">
              Open My benefits →
            </Button>
          )}
          <p className="text-small text-light">This is recorded in Vested only. Nothing is sent to {sampleOffer.employer}.</p>
        </Panel>
      </div>

      <Panel className="w-full gap-[12px]">
        <SectionHeader title={sampleOffer.packetTitle} subtitle={`Version ${sampleOffer.planVersion} · ${sampleOffer.label}`} />
        <ol className="flex flex-col gap-[8px]">
          {packetSections.map((section) => (
            <li
              key={section.id}
              id={section.id}
              className={`flex scroll-mt-[96px] flex-col gap-[4px] rounded-[10px] border px-[16px] py-[12px] transition-colors ${
                highlighted === section.id ? 'border-green bg-green-50' : 'border-line'
              }`}
            >
              <Link to={`#${section.id}`} className="text-small font-semibold text-mid hover:underline">
                §{section.number} {section.title}
              </Link>
              <p className="text-body text-ink">{section.text}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  )
}
