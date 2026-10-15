import { useState } from 'react'
import { CommunityFeed } from '../components/CommunityFeed'
import { CompanyGrid } from '../components/CompanyGrid'
import { ExploreFilters } from '../components/ExploreFilters'
import { Hero } from '../components/Hero'
import { MatchRankings } from '../components/MatchRankings'
import { TopNav } from '../components/TopNav'
import {
  communityItems,
  companies,
  heroStats,
  industries,
  navTabs,
  rankingMetrics,
  rankings,
  rankingsSection,
  roles,
} from '../data/mock'

export function ExplorePage() {
  const [activeTab, setActiveTab] = useState('explore')
  const [industry, setIndustry] = useState(industries[0])
  const [role, setRole] = useState(roles[0])

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <TopNav tabs={navTabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
    </div>
  )
}
