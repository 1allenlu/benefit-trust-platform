import { Link } from 'react-router'
import type { Company } from '../data/mock'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

type CompanyCardProps = {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="flex min-w-0 flex-1 flex-col gap-[11px] rounded-[12px] border border-line bg-surface px-[16px] py-[15px] transition-colors hover:border-line-strong"
    >
      <div className="flex items-center gap-[9px]">
        <span className="size-[28px] shrink-0 rounded-[7px] bg-shade" />
        <span className="truncate text-body font-medium text-ink">{company.name}</span>
      </div>
      <div className="flex flex-col gap-px whitespace-nowrap">
        <span className="text-num font-bold text-ink">{currency.format(company.annualValue)}</span>
        <span className="text-small text-light">employer-paid / yr</span>
      </div>
      <div className="flex items-center gap-[8px] text-small whitespace-nowrap">
        <span className="text-mid">401(k) {company.matchPercent}%</span>
        <span className="text-light">·</span>
        <span className="text-mid">{company.timeOff}</span>
      </div>
      <div className="flex items-center gap-[6px] border-t border-line pt-[9px] text-small whitespace-nowrap">
        <span className="flex-1 text-light">{company.reportCount} reports</span>
        <span className="font-medium text-t-link">View</span>
      </div>
    </Link>
  )
}
