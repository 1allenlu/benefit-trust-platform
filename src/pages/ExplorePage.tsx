import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { contentApi } from '../api'
import { CommunityFeed } from '../components/CommunityFeed'
import { CompanyGrid } from '../components/CompanyGrid'
import { ExploreFilters } from '../components/ExploreFilters'
import { Hero } from '../components/Hero'
import { MatchRankings } from '../components/MatchRankings'
import { PageShell } from '../components/PageShell'
import { PageStatus } from '../components/PageStatus'
import { defaultExploreFilters, type CompanySort } from '../data/mock'
import { useApi } from '../hooks/useApi'

export function ExplorePage() {
  const overview = useApi(() => contentApi.getExploreOverview(), [])
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [industry, setIndustry] = useState<string | null>(defaultExploreFilters.industry)
  const [role, setRole] = useState<string | null>(defaultExploreFilters.role)
  const [sort, setSort] = useState<CompanySort>('value-desc')

  // A search looks across everything, so the chip filters only apply while browsing.
  const activeIndustry = query ? null : industry
  const activeRole = query ? null : role
  const results = useApi(
    () => contentApi.searchCompanies({ q: query, industry: activeIndustry, role: activeRole, sort }),
    [query, activeIndustry, activeRole, sort],
  )

  const setQuery = (q: string) => setParams(q ? { q } : {})
  const pickFilter = (setter: (value: string | null) => void) => (value: string | null) => {
    setter(value)
    if (query) setQuery('')
  }
  const clearAll = () => {
    setIndustry(null)
    setRole(null)
    setQuery('')
  }

  return (
    <PageShell activeTab="explore" bare>
      {overview.data ? (
        <>
          <Hero stats={overview.data.heroStats} query={query} onSearch={setQuery} />
          <main className="flex w-full flex-col gap-[20px] px-[40px] pt-[24px] pb-[44px]">
            <ExploreFilters
              industries={overview.data.industries}
              moreIndustries={overview.data.moreIndustries}
              roles={overview.data.roles}
              moreRoles={overview.data.moreRoles}
              industry={activeIndustry}
              role={activeRole}
              onIndustryChange={pickFilter(setIndustry)}
              onRoleChange={pickFilter(setRole)}
            />
            {results.error ? (
              <PageStatus error={results.error} onRetry={results.retry} />
            ) : (
              <CompanyGrid
                companies={results.data?.companies}
                benefitFocus={results.data?.benefitFocus}
                loading={results.loading}
                sort={sort}
                onSortChange={setSort}
                query={query}
                onClearSearch={() => setQuery('')}
                onClearFilters={clearAll}
              />
            )}
            <div className="flex w-full items-start gap-[18px]">
              <MatchRankings
                metrics={overview.data.rankingMetrics}
                rowsByMetric={overview.data.rankings}
              />
              <CommunityFeed items={overview.data.communityItems} />
            </div>
          </main>
        </>
      ) : (
        <PageStatus loading={overview.loading} error={overview.error} onRetry={overview.retry} />
      )}
    </PageShell>
  )
}
