import { useState } from 'react'
import infoIcon from '../assets/icons/info.svg'
import type { RankingMetric, RankingRow } from '../data/mock'
import { Panel } from './Panel'
import { SectionHeader } from './SectionHeader'
import { TabItem } from './TabItem'

/** Bar length per percentage point, from the design (6.0% → 330px). */
const PX_PER_POINT = 55

function barColor(row: RankingRow) {
  if (row.isBenchmark) return 'bg-olive-300'
  if (row.value >= 6) return 'bg-teal-900'
  if (row.value >= 5) return 'bg-teal-700'
  if (row.value >= 3.5) return 'bg-teal-500'
  return 'bg-teal-300'
}

type MatchRankingsProps = {
  title: string
  subtitle: string
  metrics: RankingMetric[]
  rowsByMetric: Record<string, RankingRow[]>
}

export function MatchRankings({ title, subtitle, metrics, rowsByMetric }: MatchRankingsProps) {
  const [activeMetric, setActiveMetric] = useState(metrics[0]?.id)
  const rows = rowsByMetric[activeMetric] ?? []

  return (
    <Panel className="min-w-0 flex-1 gap-[14px] self-stretch">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={<img src={infoIcon} alt="About this ranking" width={14} height={14} className="shrink-0" />}
      />

      <div className="flex w-full gap-[4px]" role="tablist">
        {metrics.map((metric) => (
          <TabItem
            key={metric.id}
            label={metric.label}
            active={metric.id === activeMetric}
            onClick={() => setActiveMetric(metric.id)}
            paddingClassName="pt-[5px] pb-[7px]"
          />
        ))}
      </div>

      <ul className="flex w-full flex-col">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center border-b border-line py-[9px] last:border-b-0">
            <span className="w-[170px] shrink-0 pr-[12px] text-right text-small font-medium text-mid">{row.label}</span>
            <span className="h-[26px] w-px shrink-0 bg-line-strong" />
            <span className="flex min-w-0 flex-1 items-center gap-[8px]">
              <span
                className={`h-[10px] shrink-0 rounded-full ${barColor(row)}`}
                style={{ width: row.value * PX_PER_POINT }}
              />
              <span className="text-small font-medium text-ink">{row.value.toFixed(1)}%</span>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-[9px] text-small text-light">No data for this benefit yet.</li>}
      </ul>
    </Panel>
  )
}
