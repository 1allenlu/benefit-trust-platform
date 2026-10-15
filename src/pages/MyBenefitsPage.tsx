import breakdownDonut from '../assets/charts/breakdown-donut.svg'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { InfoIcon } from '../components/InfoIcon'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { currentUser, myBenefits } from '../data/mock'

const quarterColors = ['bg-teal-900', 'bg-teal-500', 'bg-teal-300']
const breakdownColors = ['bg-teal-900', 'bg-teal-700', 'bg-teal-500', 'bg-teal-300', 'bg-teal-100']
const vestingBarColors = ['bg-shade', 'bg-teal-300', 'bg-teal-500', 'bg-teal-900']

export function MyBenefitsPage() {
  const { setup } = myBenefits

  return (
    <PageShell activeTab="my-benefits" signedIn>
      <div className="flex w-full items-start gap-[20px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <h1 className="text-h1 font-bold text-ink">Welcome back, {currentUser.firstName}.</h1>
          <p className="text-body text-mid">{myBenefits.intro}</p>
          <p className="flex items-center gap-[8px] text-small whitespace-nowrap">
            <span className="text-light">{myBenefits.asOf}</span>
            <a href="#help" className="font-medium text-t-link hover:underline">
              What do these numbers mean?
            </a>
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

      <StatTileRow stats={myBenefits.stats} />

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
            action={<Button kind="ghost">See all</Button>}
          />
          <div className="overflow-hidden rounded-[10px] border border-line" role="table">
            <div className="flex gap-[12px] bg-soft px-[14px] py-[10px] text-cap font-semibold text-mid uppercase" role="row">
              <span className="w-[250px]">Benefit</span>
              <span className="w-[110px]">Category</span>
              <span className="w-[150px]">Status</span>
              <span className="w-[90px]">Value / yr</span>
            </div>
            {myBenefits.benefits.map((benefit) => (
              <div
                key={benefit.name}
                role="row"
                className="flex items-center gap-[12px] border-b border-line px-[14px] py-[11px] last:border-b-0"
              >
                <span className="w-[250px] text-body font-medium text-ink">{benefit.name}</span>
                <span className="w-[110px] text-small text-light">{benefit.category}</span>
                <span className="flex w-[150px]">
                  <Chip label={benefit.status} tone={benefit.tone} />
                </span>
                <span className="w-[90px] text-body font-medium text-ink">{benefit.value}</span>
              </div>
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
            <img src={breakdownDonut} alt="" width={140} height={140} className="shrink-0" />
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
                  <span className={`text-num font-bold ${step.current ? 'text-light' : 'text-t-teal'}`}>{step.percent}</span>
                  <span className="text-small text-mid">{step.vested}</span>
                  <span className="text-small text-light">{step.date}</span>
                </div>
                <span className={`h-[6px] w-[60px] rounded-full ${vestingBarColors[i]}`} />
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-[10px]">
            <p className="text-body font-medium text-ink">Leaving before a step forfeits the unvested part of the match.</p>
            <div className="flex-1" />
            <Button to="/my-benefits/401k">Open the 401(k) explorer</Button>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
