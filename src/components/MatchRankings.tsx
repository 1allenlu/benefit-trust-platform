import { useState } from 'react'
import type { RankingMetric, RankingRow } from '../data/mock'
import { BarList } from './BarList'
import { InfoIcon } from './InfoIcon'
import { Panel } from './Panel'
import { SectionHeader } from './SectionHeader'
import { TabItem } from './TabItem'

/** Longest bar, in px (the design's 6.0% bar). */
const MAX_BAR = 330

/** Darkest for the leaders, lighter down the list; the benchmark is olive. */
function barColor(row: RankingRow, rank: number) {
  if (row.isBenchmark) return 'bg-olive-300'
  if (rank === 0) return 'bg-teal-900'
  if (rank === 1) return 'bg-teal-700'
  if (rank <= 3) return 'bg-teal-500'
  return 'bg-teal-300'
}

const formatValue: Record<RankingMetric['unit'], (v: number) => string> = {
  percent: (v) => `${v.toFixed(1)}%`,
  days: (v) => `${v} days`,
  weeks: (v) => `${v} wks`,
}

type MatchRankingsProps = {
  metrics: RankingMetric[]
  rowsByMetric: Record<string, RankingRow[]>
}

export function MatchRankings({ metrics, rowsByMetric }: MatchRankingsProps) {
  const [activeId, setActiveId] = useState(metrics[0]?.id)
  const metric = metrics.find((m) => m.id === activeId) ?? metrics[0]
  const rows = rowsByMetric[metric.id] ?? []
  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <Panel className="min-w-0 flex-1 gap-[14px] self-stretch">
      <SectionHeader
        title={metric.title}
        subtitle={metric.subtitle}
        action={<InfoIcon label="Ranked among companies with a published, documented figure. Unknowns are left out, not scored as zero." />}
      />

      <div className="flex w-full gap-[4px]" role="tablist">
        {metrics.map((m) => (
          <TabItem
            key={m.id}
            label={m.label}
            active={m.id === metric.id}
            onClick={() => setActiveId(m.id)}
            xPadClassName="px-[12px]"
            yPadClassName="pt-[5px] pb-[7px]"
          />
        ))}
      </div>

      <BarList
        labelWidth={170}
        rows={rows.map((row, i) => ({
          label: row.label,
          width: Math.round((row.value / max) * MAX_BAR),
          colorClassName: barColor(row, i),
          valueLabel: formatValue[metric.unit](row.value),
        }))}
      />
    </Panel>
  )
}
