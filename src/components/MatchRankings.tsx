import { useState } from 'react'
import type { RankingMetric, RankingRow } from '../data/mock'
import { BarList } from './BarList'
import { InfoIcon } from './InfoIcon'
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
      <SectionHeader title={title} subtitle={subtitle} action={<InfoIcon label="About this ranking" />} />

      <div className="flex w-full gap-[4px]" role="tablist">
        {metrics.map((metric) => (
          <TabItem
            key={metric.id}
            label={metric.label}
            active={metric.id === activeMetric}
            onClick={() => setActiveMetric(metric.id)}
            xPadClassName="px-[12px]"
            yPadClassName="pt-[5px] pb-[7px]"
          />
        ))}
      </div>

      {rows.length > 0 ? (
        <BarList
          labelWidth={170}
          rows={rows.map((row) => ({
            label: row.label,
            width: row.value * PX_PER_POINT,
            colorClassName: barColor(row),
            valueLabel: `${row.value.toFixed(1)}%`,
          }))}
        />
      ) : (
        <p className="py-[9px] text-small text-light">No data for this benefit yet.</p>
      )}
    </Panel>
  )
}
