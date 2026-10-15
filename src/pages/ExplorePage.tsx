import { useState } from 'react'
import { CommunityFeed } from '../components/CommunityFeed'
import { CompanyGrid } from '../components/CompanyGrid'
import { ExploreFilters } from '../components/ExploreFilters'
import { Hero } from '../components/Hero'
import { MatchRankings } from '../components/MatchRankings'
import { PageShell } from '../components/PageShell'
import {
  communityItems,
  companies,
  heroStats,
  industries,
  rankingMetrics,
  rankings,
  rankingsSection,
  roles,
} from '../data/mock'

export function ExplorePage() {
  const [industry, setIndustry] = useState(industries[0])
  const [role, setRole] = useState(roles[0])

  return (
    <PageShell activeTab="explore" bare>
      <Hero stats={heroStats} />
      <main className="flex w-full flex-col gap-[20px] px-[40px] pt-[24px] pb-[44px]">
        <ExploreFilters
          industries={industries}
          roles={roles}
          industry={industry}
          role={role}
          onIndustryChange={setIndustry}
          onRoleChange={setRole}
        />
        <CompanyGrid companies={companies} />
        <div className="flex w-full items-start gap-[18px]">
          <MatchRankings
            title={rankingsSection.title}
            subtitle={rankingsSection.subtitle}
            metrics={rankingMetrics}
            rowsByMetric={rankings}
          />
          <CommunityFeed items={communityItems} />
        </div>
      </main>
    </PageShell>
  )
}
