import type { ReactNode } from 'react'
import { Link } from 'react-router'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-soft">
      <header className="flex h-[60px] items-center border-b border-line bg-surface px-[40px]">
        <Link to="/" className="flex items-center gap-[9px]">
          <span className="size-[24px] rounded-[7px] bg-green" />
          <span className="text-h2 font-semibold text-ink">Vested</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-[16px] pt-[72px] pb-[44px]">
        <div className="flex w-full max-w-[400px] flex-col gap-[16px]">
          <section className="flex flex-col gap-[18px] rounded-[12px] border border-line bg-surface px-[28px] pt-[26px] pb-[28px]">
            <div className="flex flex-col gap-[3px]">
              <h1 className="text-h1 font-bold text-ink">{title}</h1>
              <p className="text-body text-mid">{subtitle}</p>
            </div>
            {children}
          </section>
          <p className="text-center text-body text-mid">{footer}</p>
        </div>
      </main>
    </div>
  )
}
