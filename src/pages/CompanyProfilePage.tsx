import { useState, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'
import downloadIcon from '../assets/icons/download.svg'
import printIcon from '../assets/icons/print.svg'
import { ApiError, contentApi } from '../api'
import { BarList } from '../components/BarList'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { DonutChart } from '../components/DonutChart'
import { InfoIcon } from '../components/InfoIcon'
import { Loaded } from '../components/Loaded'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { PercentileColumns } from '../components/PercentileColumns'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { TabItem } from '../components/TabItem'
import { PostCard } from '../components/community/PostCard'
import { BarLegend } from '../components/company/BarLegend'
import { CompanyHeader } from '../components/company/CompanyHeader'
import { FactList } from '../components/company/FactList'
import { factsCsv, factsFor } from '../components/company/companyFacts'
import { defaultBaseSalary, yourCompanyId, type CommunityPost, type CompanyProfile, type CompanyRecord, type CoverageLevel } from '../data/mock'
import { useApi } from '../hooks/useApi'

// Full class names so Tailwind can see them.
const breakdownColors = [
  { bg: 'bg-teal-900', stroke: 'stroke-teal-900' },
  { bg: 'bg-teal-700', stroke: 'stroke-teal-700' },
  { bg: 'bg-teal-500', stroke: 'stroke-teal-500' },
  { bg: 'bg-teal-300', stroke: 'stroke-teal-300' },
  { bg: 'bg-teal-100', stroke: 'stroke-teal-100' },
]
const sourceColors = [
  { bg: 'bg-green', stroke: 'stroke-green' },
  { bg: 'bg-olive-300', stroke: 'stroke-olive-300' },
  { bg: 'bg-shade', stroke: 'stroke-shade' },
]

const coverageColor: Record<CoverageLevel, string> = {
  Full: 'bg-teal-900',
  Partial: 'bg-teal-500',
  Limited: 'bg-teal-300',
}

/** Full coverage bar length, in px. */
const COVERAGE_BAR_MAX = 150
/** Question-share bar length per percentage point (37.9% → 320px). */
const QUESTION_PX_PER_POINT = 8.44

const TAB_KEYS = ['overview', 'retirement', 'health', 'time-off', 'community'] as const

function questionColor(share: number) {
  if (share >= 30) return 'bg-teal-900'
  if (share >= 15) return 'bg-teal-700'
  if (share >= 5) return 'bg-teal-500'
  if (share >= 2) return 'bg-teal-300'
  return 'bg-teal-100'
}

const parseShare = (share: string) => parseFloat(share)

export function CompanyProfilePage() {
  const { companyId = '' } = useParams()
  const state = useApi(() => contentApi.getCompanyProfile(companyId), [companyId])

  if (state.error instanceof ApiError && state.error.status === 404) {
    return (
      <PageShell activeTab="companies">
        <Panel className="items-start gap-[12px]">
          <SectionHeader title="Profile not published yet" subtitle="Nobody has added this company's benefits so far." />
          <Button kind="primary" to="/contribute">
            Add this company's benefits
          </Button>
        </Panel>
      </PageShell>
    )
  }

  return (
    <PageShell activeTab="companies">
      {/* key resets tab state when moving between companies */}
      <Loaded state={state}>{(data) => <CompanyProfileContent key={data.profile.id} {...data} />}</Loaded>
    </PageShell>
  )
}

type ContentProps = {
  profile: CompanyProfile
  record: CompanyRecord
  isYourEmployer: boolean
  following: boolean
  posts: CommunityPost[]
}

function CompanyProfileContent({ profile, record, isYourEmployer, following, posts }: ContentProps) {
  const [params, setParams] = useSearchParams()
  const tabIndex = Math.max(0, TAB_KEYS.indexOf((params.get('tab') ?? 'overview') as (typeof TAB_KEYS)[number]))
  const [peerScope, setPeerScope] = useState(0)
  const facts = factsFor(record, defaultBaseSalary)
  const compareTo = isYourEmployer ? '/compare' : `/compare?ids=${yourCompanyId},${record.id}`

  const download = () => {
    const blob = new Blob([factsCsv(record, defaultBaseSalary)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `${record.id}-benefits-2026.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <CompanyHeader
        companyId={profile.id}
        name={profile.name}
        verified={profile.employerVerified}
        meta={profile.meta}
        initiallyFollowing={following}
        compareTo={compareTo}
      />

      <div className="flex w-full items-start gap-[4px] border-b border-line" role="tablist">
        {profile.subTabs.map((tab, i) => (
          <TabItem
            key={tab}
            label={tab}
            active={i === tabIndex}
            onClick={() => setParams(i === 0 ? {} : { tab: TAB_KEYS[i] }, { replace: true })}
            xPadClassName="px-[14px]"
            yPadClassName="pb-[9px]"
          />
        ))}
        <div className="flex-1" />
        <div className="flex gap-[8px] pb-[8px]">
          <button
            type="button"
            aria-label="Print"
            title="Print"
            onClick={() => window.print()}
            className="cursor-pointer rounded-[8px] border border-line px-[10px] py-[8px] hover:bg-soft"
          >
            <img src={printIcon} alt="" width={15} height={15} />
          </button>
          <button
            type="button"
            aria-label="Download as CSV"
            title="Download as CSV"
            onClick={download}
            className="cursor-pointer rounded-[8px] border border-line px-[10px] py-[8px] hover:bg-soft"
          >
            <img src={downloadIcon} alt="" width={15} height={15} />
          </button>
        </div>
      </div>

      <StatTileRow stats={profile.stats} />

      {tabIndex === 0 && <Overview profile={profile} peerScope={peerScope} setPeerScope={setPeerScope} />}

      {tabIndex === 1 && (
        <TabPanel title="401(k) & retirement" subtitle="From the 2026 Summary Plan Description">
          <FactList facts={facts.retirement} />
          {isYourEmployer ? (
            <Button kind="primary" to="/my-benefits/401k">
              Model your contribution in the 401(k) explorer
            </Button>
          ) : (
            <Button kind="primary" to={compareTo}>
              Compare with your offer
            </Button>
          )}
        </TabPanel>
      )}
      {tabIndex === 2 && (
        <TabPanel title="Health" subtitle="Employer share of premiums and accounts">
          <FactList facts={facts.health} />
        </TabPanel>
      )}
      {tabIndex === 3 && (
        <TabPanel title="Time off" subtitle="Leave policies for full-time salaried staff">
          <FactList facts={facts.timeOff} />
        </TabPanel>
      )}
      {tabIndex === 4 && (
        <div className="flex w-full flex-col gap-[14px]">
          <div className="flex items-center gap-[12px]">
            <SectionHeader
              title={`Questions and reports about ${profile.name}`}
              subtitle="Official policy and employee experience are labelled separately"
            />
            <Button kind="primary" to={`/community?ask=${record.id}`}>
              Ask a question
            </Button>
          </div>
          {posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Panel className="gap-[6px]">
              <p className="text-body font-medium text-ink">No questions yet.</p>
              <p className="text-small text-light">Be the first to ask — answers stay on this page for the next person.</p>
            </Panel>
          )}
        </div>
      )}
    </>
  )
}

function TabPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Panel className="w-full items-start gap-[14px]">
      <div className="w-full">
        <SectionHeader title={title} subtitle={subtitle} />
      </div>
      <div className="w-full">{children}</div>
    </Panel>
  )
}

function Overview({
  profile,
  peerScope,
  setPeerScope,
}: {
  profile: CompanyProfile
  peerScope: number
  setPeerScope: (i: number) => void
}) {
  return (
    <div className="flex w-full items-start gap-[18px]">
      <div className="flex w-[446px] shrink-0 flex-col gap-[18px]">
        <Panel className="gap-[14px]">
          <SectionHeader
            title="Where the value sits"
            subtitle={`Share of ${profile.valueBreakdown.total}`}
            action={<InfoIcon label="Employer-paid dollars per year at a $125,000 base salary, assuming you take the full 401(k) match." />}
          />
          <div className="flex items-center gap-[18px]">
            <BarLegend
              barHeight={28}
              items={profile.valueBreakdown.items.map((item, i) => ({
                label: item.label,
                value: item.share,
                detail: item.amount,
                colorClassName: breakdownColors[i].bg,
              }))}
            />
            <DonutChart
              size={150}
              thickness={30}
              label={`Value breakdown for ${profile.name}`}
              segments={profile.valueBreakdown.items.map((item, i) => ({
                value: parseShare(item.share),
                colorClassName: breakdownColors[i].stroke,
                label: `${item.label}: ${item.share}`,
              }))}
            />
          </div>
        </Panel>

        <Panel className="gap-[12px]">
          <SectionHeader title="Coverage by category" subtitle="What the plan actually offers" action={<InfoIcon label="Full, partial or limited against the standard benefit categories every company is described with." />} />
          <BarList
            labelWidth={132}
            rows={profile.coverage.map((row) => ({
              label: row.label,
              width: (row.score / 100) * COVERAGE_BAR_MAX,
              colorClassName: coverageColor[row.level],
              valueLabel: row.level,
            }))}
          />
        </Panel>

        <Panel className="gap-[14px]">
          <SectionHeader title="How we know this" subtitle="Source of each published field" action={<InfoIcon label="Document-backed fields outrank employee-typed ones. Undocumented fields show as unknown." />} />
          <div className="flex items-center gap-[18px]">
            <BarLegend
              barHeight={26}
              items={profile.sources.map((source, i) => ({
                label: source.label,
                value: source.share,
                colorClassName: sourceColors[i].bg,
              }))}
            />
            <DonutChart
              size={130}
              thickness={20}
              label="Sources of published fields"
              segments={profile.sources.map((source, i) => ({
                value: parseShare(source.share),
                colorClassName: sourceColors[i].stroke,
                label: `${source.label}: ${source.share}`,
              }))}
            />
          </div>
        </Panel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
        <Panel className="gap-[16px]">
          <SectionHeader
            title={profile.peers.title}
            subtitle={profile.peers.subtitle}
            action={
              <div className="flex gap-[4px]" role="tablist">
                {profile.peers.scopes.map((scope, i) => (
                  <TabItem
                    key={scope}
                    label={scope}
                    active={i === peerScope}
                    onClick={() => setPeerScope(i)}
                    xPadClassName="px-[10px]"
                    yPadClassName="pb-[6px]"
                    inactiveClassName="text-light hover:text-mid"
                  />
                ))}
              </div>
            }
          />
          <PercentileColumns
            items={peerScope === 0 ? profile.peers.percentiles : profile.peers.percentiles.map((p) => ({ ...p, value: Math.max(5, p.value - 6) }))}
            showOrdinal
          />
          <div className="flex w-full items-center gap-[10px] rounded-[8px] bg-soft px-[14px] py-[11px]">
            <span className="size-[8px] shrink-0 rounded-full bg-olive" />
            <p className="text-body font-medium text-ink">{profile.peers.note}</p>
            <div className="flex-1" />
            <p className="text-small whitespace-nowrap text-light">{profile.peers.scopeNote}</p>
          </div>
        </Panel>

        <Panel className="gap-[12px]">
          <SectionHeader title="What people ask about most" subtitle={profile.questions.subtitle} action={<InfoIcon label="Topics of questions asked about this company in the last 12 months." />} />
          <BarList
            labelWidth={210}
            rows={profile.questions.topics.map((topic) => ({
              label: topic.label,
              width: Math.round(topic.share * QUESTION_PX_PER_POINT),
              colorClassName: questionColor(topic.share),
              valueLabel: `${topic.share.toFixed(1)}%`,
            }))}
          />
          <div className="flex w-full items-center gap-[10px] rounded-[8px] bg-amber-50 px-[14px] py-[11px]">
            <Chip label="Gap" tone="flag" />
            <p className="text-body font-medium text-ink">{profile.questions.gapNote}</p>
            <div className="flex-1" />
            <p className="text-small font-medium whitespace-nowrap text-t-amber">{profile.questions.gapStatus}</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
