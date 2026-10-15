import chevronIcon from '../assets/icons/chevron-sort.svg'
import type { Company } from '../data/mock'
import { AddBenefitsCard } from './AddBenefitsCard'
import { CompanyCard } from './CompanyCard'
import { SectionHeader } from './SectionHeader'

type CompanyGridProps = {
  companies: Company[]
}

export function CompanyGrid({ companies }: CompanyGridProps) {
  return (
    <>
      <SectionHeader
        title="Benefits by company"
        subtitle="Employer-paid value per year, excluding salary, bonus and equity"
        action={
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[8px] border border-line px-[12px] py-[7px] text-small font-medium text-mid hover:bg-soft"
          >
            Highest value
            <img src={chevronIcon} alt="" width={11} height={11} />
          </button>
        }
      />
      <div className="flex w-full items-start gap-[14px]">
        <AddBenefitsCard />
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </>
  )
}
