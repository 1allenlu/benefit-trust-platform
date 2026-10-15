import { useState } from 'react'
import { useParams } from 'react-router'
import downloadIcon from '../assets/icons/download.svg'
import printIcon from '../assets/icons/print.svg'
import sourceDonut from '../assets/charts/source-donut.svg'
import valueDonut from '../assets/charts/value-donut.svg'
import { BarList } from '../components/BarList'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { InfoIcon } from '../components/InfoIcon'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { PercentileColumns } from '../components/PercentileColumns'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { TabItem } from '../components/TabItem'
import { BarLegend } from '../components/company/BarLegend'
import { CompanyHeader } from '../components/company/CompanyHeader'
import { companyProfiles, type CoverageLevel } from '../data/mock'

const breakdownColors = ['bg-teal-900', 'bg-teal-700', 'bg-teal-500', 'bg-teal-300', 'bg-teal-100']
const sourceColors = ['bg-green', 'bg-olive-300', 'bg-shade']

const coverageColor: Record<CoverageLevel, string> = {
  Full: 'bg-teal-900',
  Partial: 'bg-teal-500',
  Limited: 'bg-teal-300',
}

/** Full coverage bar length, in px. */
const COVERAGE_BAR_MAX = 150
/** Question-share bar length per percentage point (37.9% → 320px). */
const QUESTION_PX_PER_POINT = 8.44

function questionColor(share: number) {
  if (share >= 30) return 'bg-teal-900'
  if (share >= 15) return 'bg-teal-700'
  if (share >= 5) return 'bg-teal-500'
  if (share >= 2) return 'bg-teal-300'
  return 'bg-teal-100'
}

export function CompanyProfilePage() {
  const { companyId = '' } = useParams()
  const profile = companyProfiles[companyId]
  const [subTab, setSubTab] = useState(0)
  const [peerScope, setPeerScope] = useState(0)

  if (!profile) {
    return (
      <PageShell activeTab="companies">
        <Panel className="items-start gap-[12px]">
          <SectionHeader title="Profile not published yet" subtitle="Nobody has added this company's benefits so far." />
          <Button kind="primary" to="/companies/northstar">
            See an example profile
          </Button>
        </Panel>
      </PageShell>
    )
  }

  return (
    <PageShell activeTab="companies">
      <CompanyHeader name={profile.name} verified={profile.employerVerified} meta={profile.meta} />

      <div className="flex w-full items-start gap-[4px] border-b border-line" role="tablist">
        {profile.subTabs.map((tab, i) => (
          <TabItem
            key={tab}
            label={tab}
            active={i === subTab}
            onClick={() => setSubTab(i)}
            xPadClassName="px-[14px]"
            yPadClassName="pb-[9px]"
          />
        ))}
        <div className="flex-1" />
        <div className="flex gap-[8px] pb-[8px]">
          <button
            type="button"
            aria-label="Print"
            onClick={() => window.print()}
            className="cursor-pointer rounded-[8px] border border-line px-[10px] py-[8px] hover:bg-soft"
          >
            <img src={printIcon} alt="" width={15} height={15} />
          </button>
          <button type="button" aria-label="Download" className="cursor-pointer rounded-[8px] border border-line px-[10px] py-[8px] hover:bg-soft">
            <img src={downloadIcon} alt="" width={15} height={15} />
          </button>
        </div>
      </div>

      <StatTileRow stats={profile.stats} />

      <div className="flex w-full items-start gap-[18px]">
        <div className="flex w-[446px] shrink-0 flex-col gap-[18px]">
          <Panel className="gap-[14px]">
            <SectionHeader
              title="Where the value sits"
              subtitle={`Share of ${profile.valueBreakdown.total}`}
              action={<InfoIcon />}
            />
            <div className="flex items-center gap-[18px]">
              <BarLegend
                barHeight={28}
                items={profile.valueBreakdown.items.map((item, i) => ({
                  label: item.label,
                  value: item.share,
                  detail: item.amount,
                  colorClassName: breakdownColors[i],
                }))}
              />
              <img src={valueDonut} alt="" width={150} height={150} className="shrink-0" />
            </div>
          </Panel>

          <Panel className="gap-[12px]">
            <SectionHeader title="Coverage by category" subtitle="What the plan actually offers" action={<InfoIcon />} />
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
            <SectionHeader title="How we know this" subtitle="Source of each published field" action={<InfoIcon />} />
            <div className="flex items-center gap-[18px]">
              <BarLegend
                barHeight={26}
                items={profile.sources.map((source, i) => ({
                  label: source.label,
                  value: source.share,
                  colorClassName: sourceColors[i],
                }))}
              />
              <img src={sourceDonut} alt="" width={130} height={130} className="shrink-0" />
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
            <PercentileColumns items={profile.peers.percentiles} showOrdinal />
            <div className="flex w-full items-center gap-[10px] rounded-[8px] bg-soft px-[14px] py-[11px]">
              <span className="size-[8px] shrink-0 rounded-full bg-olive" />
              <p className="text-body font-medium text-ink">{profile.peers.note}</p>
              <div className="flex-1" />
              <p className="text-small whitespace-nowrap text-light">{profile.peers.scopeNote}</p>
            </div>
          </Panel>

          <Panel className="gap-[12px]">
            <SectionHeader
              title="What people ask about most"
              subtitle={profile.questions.subtitle}
              action={<InfoIcon />}
            />
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
    </PageShell>
  )
}
