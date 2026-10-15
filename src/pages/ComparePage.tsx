import { useState } from 'react'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { BenefitMatrix } from '../components/compare/BenefitMatrix'
import { ScopeSelect } from '../components/compare/ScopeSelect'
import { ValueStack } from '../components/compare/ValueStack'
import { compareView } from '../data/mock'

/** Fit bar length per score point (81 → 162px). */
const FIT_PX_PER_POINT = 2

export function ComparePage() {
  const [scope, setScope] = useState(() => compareView.scope.map((s) => s.value))

  return (
    <PageShell activeTab="compare">
      <PageHeader
        title="Compare benefits"
        subtitle="Three employers, same scope. Change the scope and every column changes with it."
        actions={
          <>
            <Button>Save comparison</Button>
            <Button kind="primary">Add a company</Button>
          </>
        }
      />

      <section className="flex w-full items-end gap-[14px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
        {compareView.scope.map((field, i) => (
          <ScopeSelect
            key={field.label}
            label={field.label}
            value={scope[i]}
            options={field.options}
            onChange={(value) => setScope((prev) => prev.map((v, j) => (j === i ? value : v)))}
          />
        ))}
        <div className="pb-[8px]">
          <Chip label="Like-for-like" tone="verified" />
        </div>
      </section>

      <ValueStack legend={compareView.stackLegend} employers={compareView.employers} />
      <BenefitMatrix employers={compareView.employers} rows={compareView.matrix} />

      <div className="flex w-full items-start gap-[18px]">
        <Panel className="min-w-0 flex-1 gap-[14px] self-stretch">
          <SectionHeader
            title="Fit against your priorities"
            subtitle={compareView.priorities}
            action={<Chip label="Private to you" tone="teal" />}
          />
          {compareView.fit.map((row) => (
            <div key={row.name} className="flex items-center gap-[12px] py-[10px]">
              <div className="flex w-[190px] shrink-0 flex-col gap-px whitespace-nowrap">
                <span className="text-body font-medium text-ink">{row.name}</span>
                <span className="truncate text-small text-light">{row.note}</span>
              </div>
              <div className="h-[10px] min-w-0 flex-1 overflow-hidden rounded-full bg-shade">
                <div
                  className={`h-full rounded-full ${row.isYours ? 'bg-green' : 'bg-teal-500'}`}
                  style={{ width: row.score * FIT_PX_PER_POINT }}
                />
              </div>
              <span className="text-num-m font-semibold text-ink">{row.score}</span>
            </div>
          ))}
          <p className="text-small text-light">
            Fit is computed from the priorities you saved, on your device. Neither employer sees it, and it is not
            comparable between people.
          </p>
        </Panel>

        <Panel className="w-[400px] shrink-0 gap-[12px] self-stretch">
          <SectionHeader title="What we still don't know" subtitle="Shown as unknown, never scored as zero" />
          <ul className="flex flex-col gap-[12px]">
            {compareView.unknowns.map((item) => (
              <li key={item.field} className="flex flex-col gap-[4px] border-b border-line py-[10px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-body font-medium text-ink">{item.field}</span>
                  <div className="flex-1" />
                  <Chip label="Unknown" tone="muted" />
                </div>
                <p className="text-small text-light">{item.detail}</p>
              </li>
            ))}
          </ul>
          <Button className="w-full">Ask these employers</Button>
        </Panel>
      </div>
    </PageShell>
  )
}
