import chevronIcon from '../assets/icons/chevron-sort.svg'
import { companySortOptions, type Company, type CompanySort } from '../data/mock'
import { AddBenefitsCard } from './AddBenefitsCard'
import { CompanyCard } from './CompanyCard'
import { SectionHeader } from './SectionHeader'

type CompanyGridProps = {
  companies: Company[] | undefined
  loading: boolean
  sort: CompanySort
  onSortChange: (sort: CompanySort) => void
  /** Active search text, if any. */
  query: string
  /** Benefit the results are ranked by, for benefit searches. */
  benefitFocus?: string
  onClearSearch: () => void
  onClearFilters: () => void
}

export function CompanyGrid({
  companies,
  loading,
  sort,
  onSortChange,
  query,
  benefitFocus,
  onClearSearch,
  onClearFilters,
}: CompanyGridProps) {
  const count = companies?.length ?? 0

  return (
    <>
      <SectionHeader
        title={benefitFocus ? `Ranked by ${benefitFocus}` : query ? `Results for “${query}”` : 'Benefits by company'}
        subtitle={
          benefitFocus
            ? `${count} companies · best documented ${benefitFocus} first; undocumented last, never scored as zero`
            : query
              ? `${count} ${count === 1 ? 'company' : 'companies'} · employer-paid value per year, excluding salary, bonus and equity`
              : 'Employer-paid value per year, excluding salary, bonus and equity'
        }
        action={
          <div className="flex shrink-0 items-center gap-[12px]">
            {query && (
              <button type="button" onClick={onClearSearch} className="cursor-pointer text-small font-medium text-t-link hover:underline">
                Clear search
              </button>
            )}
            <label className={`relative items-center ${benefitFocus ? 'hidden' : 'flex'}`}>
              <span className="sr-only">Sort companies</span>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as CompanySort)}
                className="cursor-pointer appearance-none rounded-[8px] border border-line bg-surface py-[7px] pr-[30px] pl-[12px] text-small font-medium text-mid outline-none hover:bg-soft"
              >
                {companySortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <img src={chevronIcon} alt="" width={11} height={11} className="pointer-events-none absolute right-[12px]" />
            </label>
          </div>
        }
      />
      <div
        className={`grid w-full grid-cols-6 items-start gap-[14px] transition-opacity ${loading ? 'opacity-60' : ''}`}
        aria-busy={loading}
      >
        <AddBenefitsCard />
        {companies?.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
        {companies && count === 0 && (
          <div className="col-span-5 flex flex-col items-start gap-[6px] rounded-[12px] border border-line px-[16px] py-[15px]">
            <p className="text-body font-medium text-ink">No companies match.</p>
            <p className="text-small text-light">Try a different search, or widen the industry and role filters.</p>
            <button type="button" onClick={onClearFilters} className="cursor-pointer text-small font-medium text-t-link hover:underline">
              Show all companies
            </button>
          </div>
        )}
      </div>
    </>
  )
}
