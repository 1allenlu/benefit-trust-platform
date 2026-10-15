import searchIcon from '../assets/icons/search-lg.svg'
import type { HeroStat } from '../data/mock'

type HeroProps = {
  stats: HeroStat[]
  /** Current search text, shown in the box. */
  query: string
  onSearch: (query: string) => void
}

export function Hero({ stats, query, onSearch }: HeroProps) {
  return (
    <section className="flex w-full flex-col items-center border-b border-line bg-soft px-[40px] pt-[46px] pb-[42px]">
      <div className="flex w-full max-w-[780px] flex-col items-center gap-[14px] text-center">
        <h1 className="text-display font-bold text-ink">Know what your benefits are actually worth.</h1>
        <p className="text-body text-mid">
          Salary is the easy part. Compare 401(k) matches, health coverage and time off across employers — from real
          plan documents and the people who use them.
        </p>

        <form
          role="search"
          className="flex h-[54px] w-full max-w-[620px] items-center gap-[10px] rounded-full border border-line-strong bg-surface py-[7px] pr-[7px] pl-[20px]"
          onSubmit={(e) => {
            e.preventDefault()
            onSearch(String(new FormData(e.currentTarget).get('q') ?? '').trim())
          }}
        >
          <img src={searchIcon} alt="" width={18} height={18} className="shrink-0" />
          <input
            key={query}
            name="q"
            type="search"
            defaultValue={query}
            aria-label="Search companies"
            placeholder="Search by company, benefit, or city"
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-light"
          />
          <button
            type="submit"
            className="shrink-0 cursor-pointer rounded-full bg-green px-[22px] py-[11px] text-body font-medium text-on-dark hover:bg-t-green"
          >
            Search
          </button>
        </form>

        <ul className="flex items-center gap-[18px] whitespace-nowrap">
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-center gap-[5px]">
              <span className="text-body font-medium text-ink">{stat.value}</span>
              <span className="text-small text-light">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
