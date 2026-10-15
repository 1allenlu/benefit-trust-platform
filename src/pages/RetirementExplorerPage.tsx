import { Link } from 'react-router'
import documentIcon from '../assets/icons/document.svg'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { ContributionSlider } from '../components/retirement/ContributionSlider'
import { MatchCurve } from '../components/retirement/MatchCurve'
import { retirementExplorer as data } from '../data/mock'

const MATCH_CAP_PERCENT = 5
const SLIDER_MAX_PERCENT = 10

export function RetirementExplorerPage() {
  return (
    <PageShell activeTab="my-benefits" signedIn bare>
      <main className="flex w-full flex-col gap-[18px] px-[40px] pt-[20px] pb-[44px]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-[7px] text-small whitespace-nowrap text-light">
          <Link to="/my-benefits" className="hover:text-mid">
            My benefits
          </Link>
          <span>/</span>
          <span>Retirement &amp; savings</span>
          <span>/</span>
          <span className="font-medium text-ink" aria-current="page">
            401(k)
          </span>
        </nav>

        <PageHeader
          title="What changes if you contribute more?"
          subtitle="Move the slider. Nothing here is submitted anywhere — this is a scenario, not a change to your account."
          actions={<Chip label={data.verifiedOn} tone="verified" />}
        />

        <StatTileRow stats={data.stats} />

        <div className="flex w-full items-start gap-[18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            <Panel className="gap-[18px]">
              <SectionHeader
                title="Your contribution"
                subtitle={`Northstar's share stops growing after ${MATCH_CAP_PERCENT}%`}
                action={
                  <span className="flex shrink-0 items-center gap-[6px] rounded-full bg-green-50 px-[12px] py-[6px] text-t-green">
                    <span className="text-num-m font-semibold">{data.contributionPercent}%</span>
                    <span className="text-small">of pay</span>
                  </span>
                }
              />
              <ContributionSlider
                value={data.contributionPercent}
                matchCapPercent={MATCH_CAP_PERCENT}
                maxPercent={SLIDER_MAX_PERCENT}
              />
              <MatchCurve contributionPercent={data.contributionPercent} matchCapPercent={MATCH_CAP_PERCENT} />

              <div className="flex w-full items-center gap-[11px] rounded-[8px] bg-green-50 px-[16px] py-[12px]">
                <span className="size-[9px] shrink-0 rounded-full bg-green" />
                <div className="flex min-w-0 flex-col gap-px">
                  <p className="text-body font-medium text-ink">{data.insight.title}</p>
                  <p className="text-small text-mid">{data.insight.sub}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[10px] border border-line" role="table">
                <div className="flex bg-soft px-[16px] py-[11px] text-cap font-semibold text-mid uppercase" role="row">
                  {['You contribute', 'From your pay', 'Northstar adds', 'Total saved', 'Match left behind'].map((h) => (
                    <span key={h} className="flex-1" role="columnheader">
                      {h}
                    </span>
                  ))}
                </div>
                {data.scenarios.map((row) => (
                  <div
                    key={row.contribute}
                    role="row"
                    className={`flex px-[16px] py-[11px] text-body ${
                      row.current ? 'bg-green-50 font-medium text-t-green' : 'bg-surface text-mid'
                    }`}
                  >
                    <span className="flex-1">{row.contribute}</span>
                    <span className="flex-1">{row.fromPay}</span>
                    <span className="flex-1">{row.employer}</span>
                    <span className="flex-1">{row.total}</span>
                    <span className="flex-1">{row.leftBehind}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <section className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
              <SectionHeader
                title="What these numbers deliberately do not tell you"
                action={<Chip label="Out of scope" tone="muted" />}
              />
              <div className="flex gap-[18px]">
                {data.outOfScope.map((item) => (
                  <div key={item.title} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <p className="text-body font-medium text-ink">{item.title}</p>
                    <p className="text-small text-mid">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex w-[406px] shrink-0 flex-col gap-[16px]">
            <section className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-softer px-[20px] pt-[18px] pb-[20px]">
              <div className="flex items-center gap-[8px]">
                <Chip label="Education" tone="teal" />
                <h2 className="text-h2 font-semibold whitespace-nowrap text-ink">Inside your Northstar plan</h2>
              </div>
              <p className="text-small text-mid">
                You can split your {data.contributionPercent}% between two kinds of contribution. The match is identical
                either way.
              </p>
              {data.planOptions.map((option) => (
                <div key={option.title} className="flex flex-col gap-[3px] rounded-[8px] border border-line bg-surface px-[13px] py-[11px]">
                  <p className="text-body font-medium text-ink">{option.title}</p>
                  <p className="text-small text-mid">{option.body}</p>
                </div>
              ))}
              <p className="text-small text-light">
                Which is better depends on your tax situation now versus later. We will not guess that for you.
              </p>
            </section>

            <section className="flex flex-col items-start gap-[9px] rounded-[12px] border-2 border-dashed border-line-strong bg-surface px-[18px] py-[16px]">
              <Chip label="Not an employer benefit" tone="muted" />
              <h2 className="text-h2 font-semibold text-ink">A Roth IRA is a different thing</h2>
              <p className="text-small text-mid">
                Same word, different account. A Roth IRA is personal — you open it yourself at a bank or broker. Northstar
                does not offer it, does not match it, and is not involved. We keep it behind this line so the two never
                blur.
              </p>
              <Button kind="ghost">Learn the difference →</Button>
            </section>

            <section className="flex flex-col gap-[10px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
              <div className="flex items-center gap-[8px]">
                <h2 className="text-h2 font-semibold text-ink">What this assumes</h2>
                <div className="flex-1" />
                <button type="button" className="cursor-pointer text-small font-medium text-t-link hover:underline">
                  Edit
                </button>
              </div>
              <dl className="flex flex-col gap-[10px]">
                {data.assumptions.map((row) => (
                  <div key={row.label} className="flex items-start gap-[10px]">
                    <dt className="w-[74px] shrink-0 text-cap font-semibold whitespace-nowrap text-light uppercase">
                      {row.label}
                    </dt>
                    <dd className="min-w-0 flex-1 text-small text-mid">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <a href="#source" className="flex items-center gap-[7px] rounded-[8px] bg-surface px-[11px] py-[9px]">
                <img src={documentIcon} alt="" width={13} height={13} className="shrink-0" />
                <span className="min-w-0 flex-1 text-small text-t-link">{data.source}</span>
              </a>
            </section>

            <Panel className="gap-[10px]">
              <h2 className="text-h2 font-semibold text-ink">What to do with this</h2>
              <Button kind="primary" className="w-full">
                Set {data.contributionPercent}% in Fidelity ↗
              </Button>
              <Button className="w-full">Save to my action plan</Button>
              <Button kind="ghost" className="w-full">
                Ask People Ops about vesting
              </Button>
              <p className="text-small text-light">
                Changes happen in Fidelity, not here. We never submit anything on your behalf.
              </p>
            </Panel>
          </aside>
        </div>
      </main>
    </PageShell>
  )
}
