import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import chevronDownIcon from '../assets/icons/chevron-down.svg'
import { contentApi, isMockApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import type { User } from '../data/mock'

export function AccountMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = async () => {
    setOpen(false)
    // Leave first: on a protected page, clearing the user would bounce to /login.
    navigate('/')
    await logout()
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-[8px]"
      >
        <span className="size-[30px] rounded-full border border-line bg-green-50" />
        <span className="text-body font-medium text-ink">{user.shortName}</span>
        <img src={chevronDownIcon} alt="" width={12} height={12} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-10 flex w-[220px] flex-col rounded-[10px] border border-line bg-surface p-[6px] shadow-[0_8px_24px_rgba(14,26,23,0.08)]"
        >
          <div className="flex flex-col px-[10px] py-[8px]">
            <span className="text-body font-medium text-ink">{user.shortName}</span>
            <span className="truncate text-small text-light">{user.email}</span>
          </div>
          <div className="my-[4px] h-px bg-line" />
          <Link
            role="menuitem"
            to="/my-benefits"
            onClick={() => setOpen(false)}
            className="rounded-[6px] px-[10px] py-[8px] text-body text-ink hover:bg-soft"
          >
            My benefits
          </Link>
          {isMockApi && (
            <button
              role="menuitem"
              type="button"
              onClick={async () => {
                setOpen(false)
                await contentApi.resetDemo()
                window.location.assign('/')
              }}
              className="cursor-pointer rounded-[6px] px-[10px] py-[8px] text-left text-body text-ink hover:bg-soft"
            >
              Reset demo data
            </button>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            className="cursor-pointer rounded-[6px] px-[10px] py-[8px] text-left text-body text-ink hover:bg-soft"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
