import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import bellIcon from '../assets/icons/bell.svg'
import { contentApi } from '../api'
import { useApi } from '../hooks/useApi'
import { buildReminders, localToday } from '../lib/offer'
import { track } from '../lib/research'

const notifications = [
  { id: 'n1', title: 'Medical enrolment closes 16 Feb', detail: 'Pick a plan in Workday', to: '/my-benefits' },
  { id: 'n2', title: 'Northstar answered a question you follow', detail: 'Vesting and internal moves', to: '/community' },
  { id: 'n3', title: 'Meridian Health updated its 2026 plan', detail: '6% match confirmed', to: '/companies/meridian' },
]

/** Offer reminders (deadlines, open HR questions, benefits becoming usable) for everyone; account updates when signed in. */
export function Notifications({ signedIn }: { signedIn: boolean }) {
  const offer = useApi(() => contentApi.getOffer(), [])
  const reminders = offer.data ? buildReminders(offer.data.tasks, offer.data.milestones, localToday()) : []
  const items = [...reminders.map((r) => ({ ...r, to: '/my-benefits' })), ...(signedIn ? notifications : [])]
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!items.length && !signedIn) return null

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          if (!open && reminders.length) track('reminders_opened', String(reminders.length))
          setOpen((o) => !o)
          setSeen(true)
        }}
        className="relative cursor-pointer rounded-full bg-soft p-[8px] hover:bg-shade"
      >
        <img src={bellIcon} alt="" width={16} height={16} />
        {!seen && items.length > 0 && <span className="absolute top-[6px] right-[6px] size-[7px] rounded-full border border-surface bg-amber" />}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-20 flex w-[300px] flex-col rounded-[10px] border border-line bg-surface p-[6px] shadow-[0_8px_24px_rgba(14,26,23,0.08)]">
          <p className="px-[10px] pt-[6px] pb-[4px] text-cap font-semibold text-light uppercase">Notifications</p>
          {items.length === 0 && <p className="px-[10px] py-[8px] text-small text-light">Nothing new.</p>}
          {items.map((n) => (
            <Link key={n.id} to={n.to} onClick={() => setOpen(false)} className="flex flex-col rounded-[6px] px-[10px] py-[8px] hover:bg-soft">
              <span className="text-body font-medium text-ink">{n.title}</span>
              <span className="text-small text-light">{n.detail}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
