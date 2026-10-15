import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { InfoIcon } from '../components/InfoIcon'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { ActionPlan } from '../components/ActionPlan'
import { DonutChart } from '../components/DonutChart'
import { Modal } from '../components/Modal'
import { contentApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Loaded } from '../components/Loaded'
import type { MyBenefits } from '../data/mock'
import { useApi } from '../hooks/useApi'

const quarterColors = ['bg-teal-900', 'bg-teal-500', 'bg-teal-300']
const breakdownColors = ['bg-teal-900', 'bg-teal-700', 'bg-teal-500', 'bg-teal-300', 'bg-teal-100']
const vestingBarColors = ['bg-shade', 'bg-teal-300', 'bg-teal-500', 'bg-teal-900']

export function MyBenefitsPage() {
  const state = useApi(() => contentApi.getMyBenefits(), [])
  return (
    <PageShell activeTab="my-benefits">
      <Loaded state={state}>{(data) => <MyBenefitsContent myBenefits={data} />}</Loaded>
    </PageShell>
  )
}

const breakdownStrokes = ['stroke-teal-900', 'stroke-teal-700', 'stroke-teal-500', 'stroke-teal-300', 'stroke-teal-100']

function MyBenefitsContent({ myBenefits }: { myBenefits: MyBenefits }) {
  const { user } = useAuth()
  const { setup } = myBenefits
  const [actions, setActions] = useState(myBenefits.actionPlan)
  const [explaining, setExplaining] = useState(false)
  const openActions = actions.filter((a) => !a.done)
  const dueSoon = openActions.filter((a) => a.due).length
  const stats = myBenefits.stats.map((stat) =>
    stat.label === 'Actions open'
      ? {
          ...stat,
          value: String(openActions.length),
          sub: openActions.length ? (dueSoon ? `${dueSoon} due by 16 Feb` : 'nothing due this month') : 'all done',
          tone: openActions.length ? ('flag' as const) : ('default' as const),
        }
      : stat,
  )

  return (
    <>
      <div className="flex w-full items-start gap-[20px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <h1 className="text-h1 font-bold text-ink">Welcome back{user ? `, ${user.firstName}` : ''}.</h1>
          <p className="text-body text-mid">{myBenefits.intro}</p>
          <p className="flex items-center gap-[8px] text-small whitespace-nowrap">
            <span className="text-light">{myBenefits.asOf}</span>
            <button type="button" onClick={() => setExplaining(true)} className="cursor-pointer font-medium text-t-link hover:underline">
              What do these numbers mean?
            </button>
          </p>
        </div>
        <div className="flex w-[390px] shrink-0 items-center gap-[14px] rounded-[12px] border border-green bg-green-50 py-[16px] pr-[20px] pl-[18px]">
          <span className="size-[40px] shrink-0 rounded-[10px] bg-surface" />
          <div className="flex min-w-0 flex-col gap-[2px] whitespace-nowrap">
            <span className="text-small text-mid">Employer-paid benefits value</span>
            <span className="text-num-xl font-bold text-t-green">{myBenefits.totalValue}</span>
            <span className="text-small text-light">Excludes salary, bonus and equity</span>
          </div>
        </div>
      </div>

      <StatTileRow stats={stats} />

      <div className="flex w-full flex-col gap-[6px]">
        <div className="flex items-center gap-[8px] text-small font-medium whitespace-nowrap">
          <span className="text-mid">Benefits set up so far</span>
          <div className="flex-1" />
          <span className="text-ink">
            {setup.done} of {setup.total} set up · {setup.valueDone} of {setup.valueTotal}
          </span>
        </div>
        <div
          className="h-[12px] w-full overflow-hidden rounded-full bg-shade"
          role="progressbar"
          aria-valuenow={setup.done}
          aria-valuemax={setup.total}
        >
          <div className="h-full rounded-full bg-green" style={{ width: `${setup.ratio * 100}%` }} />
        </div>
        <p className="text-small text-light">{setup.note}</p>
      </div>

      <div className="flex w-full items-start gap-[18px]">
        <Panel className="min-w-0 flex-1 gap-[12px] self-stretch">
          <SectionHeader
            title="Your benefits"
            subtitle={`${myBenefits.benefits.length} in your package`}
            action={
              <Button kind="ghost" to="/companies/northstar">
                See all
              </Button>
            }
          />
          <div className="overflow-hidden rounded-[10px] border border-line" role="table">
            <div
              className="flex gap-[12px] bg-soft px-[14px] py-[10px] text-cap font-semibold text-mid uppercase"
              role="row"
            >
              <span className="w-[250px]">Benefit</span>
              <span className="w-[110px]">Category</span>
              <span className="w-[150px]">Status</span>
              <span className="w-[90px]">Value / yr</span>
            </div>
            {myBenefits.benefits.map((benefit) => (
              <Link
                key={benefit.name}
                to={benefit.to}
                role="row"
                className="flex items-center gap-[12px] border-b border-line px-[14px] py-[11px] last:border-b-0 hover:bg-softer"
              >
                <span className="w-[250px] text-body font-medium text-ink">{benefit.name}</span>
                <span className="w-[110px] text-small text-light">{benefit.category}</span>
                <span className="flex w-[150px]">
                  <Chip label={benefit.status} tone={benefit.tone} />
                </span>
                <span className="w-[90px] text-body font-medium text-ink">{benefit.value}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="w-[430px] shrink-0 gap-[14px] self-stretch">
          <SectionHeader title="Value through the year" subtitle="What Northstar pays in, by quarter" />
          <div className="flex w-full items-start justify-between px-[6px] pt-[6px]">
            {myBenefits.quarters.map((quarter) => (
              <div key={quarter.label} className="flex flex-col items-center gap-[7px]">
                <div className="flex h-[200px] w-[62px] flex-col items-center justify-end gap-[2px]">
                  <span className="text-small font-medium text-ink">{quarter.total}</span>
                  {quarter.segments.map((height, i) => (
                    <span
                      key={myBenefits.quarterLegend[i]}
                      className={`w-[54px] shrink-0 rounded-[3px] ${quarterColors[i]}`}
                      style={{ height }}
                    />
                  ))}
                </div>
                <span className="text-small text-mid">{quarter.label}</span>
              </div>
            ))}
          </div>
          <ul className="flex items-center gap-[10px]">
            {myBenefits.quarterLegend.map((label, i) => (
              <li key={label} className="flex items-center gap-[5px] text-small text-mid">
                <span className={`size-[7px] rounded-full ${quarterColors[i]}`} />
                {label}
              </li>
            ))}
          </ul>
          <p className="text-small text-light">
            Gross employer amounts. No tax effects, and no investment growth — we do not predict returns.
          </p>
        </Panel>
      </div>

      <div className="flex w-full items-start gap-[18px]">
        <Panel className="w-[430px] shrink-0 gap-[14px] self-stretch">
          <SectionHeader title="Your breakdown" subtitle={`Share of ${myBenefits.totalValue}`} action={<InfoIcon />} />
          <div className="flex items-center gap-[16px]">
            <DonutChart
              size={140}
              thickness={28}
              label="Your benefits breakdown"
              segments={myBenefits.breakdown.map((item, i) => ({
                value: parseFloat(item.share),
                colorClassName: breakdownStrokes[i],
                label: `${item.label}: ${item.share}`,
              }))}
            />
            <ul className="flex min-w-0 flex-1 flex-col gap-[8px]">
              {myBenefits.breakdown.map((item, i) => (
                <li key={item.label} className="flex items-center gap-[8px] text-small">
                  <span className={`size-[8px] shrink-0 rounded-full ${breakdownColors[i]}`} />
                  <span className="text-mid">{item.label}</span>
                  <div className="flex-1" />
                  <span className="font-medium text-ink">{item.share}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <section className="flex min-w-0 flex-1 flex-col gap-[14px] self-stretch rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
          <SectionHeader
            title="Your vesting ladder"
            subtitle="Northstar's match becomes yours in three steps"
            action={<Chip label="Your own money is always 100% yours" tone="teal" />}
          />
          <ol className="flex w-full items-start justify-between px-[20px] py-[10px]">
            {myBenefits.vesting.map((step, i) => (
              <li key={step.step} className="flex flex-col items-center gap-[8px]">
                <div
                  className={`flex flex-col items-center gap-[3px] rounded-[10px] bg-surface px-[18px] py-[14px] whitespace-nowrap ${
                    step.current ? 'border-2 border-line-strong' : 'border border-line'
                  }`}
                >
                  <span className="text-cap font-semibold text-light uppercase">{step.step}</span>
                  <span className={`text-num font-bold ${step.current ? 'text-light' : 'text-t-teal'}`}>
                    {step.percent}
                  </span>
                  <span className="text-small text-mid">{step.vested}</span>
                  <span className="text-small text-light">{step.date}</span>
                </div>
                <span className={`h-[6px] w-[60px] rounded-full ${vestingBarColors[i]}`} />
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-[10px]">
            <p className="text-body font-medium text-ink">
              Leaving before a step forfeits the unvested part of the match.
            </p>
            <div className="flex-1" />
            <Button to="/my-benefits/401k">Open the 401(k) explorer</Button>
          </div>
        </section>
      </div>

      <ActionPlan items={actions} onChange={setActions} />

      {explaining && (
        <Modal title="What do these numbers mean?" onClose={() => setExplaining(false)}>
          <div className="flex flex-col gap-[10px]">
            {myBenefits.explainer.map((p) => (
              <p key={p} className="text-body text-mid">
                {p}
              </p>
            ))}
          </div>
          <Button kind="primary" onClick={() => setExplaining(false)} className="self-start">
            Got it
          </Button>
        </Modal>
      )}
    </>
  )
}
