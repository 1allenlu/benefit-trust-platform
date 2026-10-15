import completenessRing from '../assets/charts/completeness-ring.svg'
import crossIcon from '../assets/icons/cross-dark.svg'
import infoTealIcon from '../assets/icons/info-teal.svg'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { EmployerTopNav } from '../components/EmployerTopNav'
import { Panel } from '../components/Panel'
import { PercentileColumns } from '../components/PercentileColumns'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { employerDashboard as data } from '../data/mock'

/** "People affected" bar length per employee (42 → 76px). */
const AFFECTED_PX_PER_PERSON = 1.8

export function EmployerDashboardPage() {
  const { sourceSplit } = data

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <EmployerTopNav tabs={data.tabs} orgLabel={data.org} />
      <main className="flex w-full flex-col gap-[18px] px-[40px] pt-[22px] pb-[44px]">
        <div className="flex w-full items-start gap-[20px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <h1 className="text-h1 font-bold text-ink">{data.title}</h1>
            <p className="text-body text-mid">{data.intro}</p>
            <p className="flex items-center gap-[8px] text-small whitespace-nowrap">
              <span className="text-light">{data.asOf}</span>
              <a href="#method" className="font-medium text-t-link hover:underline">
                How these numbers are produced
              </a>
            </p>
          </div>
          <div className="flex w-[400px] shrink-0 items-center gap-[14px] rounded-[12px] bg-teal-100 py-[16px] pr-[20px] pl-[18px]">
            <img src={completenessRing} alt="" width={54} height={54} className="shrink-0" />
            <div className="flex min-w-0 flex-col gap-[2px] whitespace-nowrap text-t-teal">
              <span className="text-small">Profile completeness</span>
              <span className="text-num-xl font-bold">{data.completeness.value}</span>
              <span className="text-small">{data.completeness.sub}</span>
            </div>
          </div>
        </div>

        <StatTileRow stats={data.stats} />

        <div className="flex w-full flex-col gap-[6px]">
          <div className="flex items-center gap-[8px] text-small whitespace-nowrap">
            <span className="font-medium text-mid">Published fields by source</span>
            <div className="flex-1" />
            <span className="text-light">
              {sourceSplit.documents}% plan documents · {sourceSplit.reports}% employee reports · {sourceSplit.undocumented}% not
              documented
            </span>
          </div>
          <div className="flex h-[12px] w-full gap-[2px] overflow-hidden rounded-full">
            <span className="h-full rounded-full bg-teal-900" style={{ flexGrow: sourceSplit.documents }} />
            <span className="h-full rounded-full bg-olive-300" style={{ flexGrow: sourceSplit.reports }} />
            <span className="h-full rounded-full bg-shade" style={{ flexGrow: sourceSplit.undocumented }} />
          </div>
        </div>

        <div className="flex w-full items-start gap-[18px]">
          <Panel className="min-w-0 flex-1 gap-[12px] self-stretch">
            <SectionHeader
              title="Where your explanations are failing"
              subtitle="Minimum 10 employees per row — anything smaller reads Insufficient data"
              action={<Chip label="Aggregate only" tone="teal" />}
            />
            <div className="overflow-hidden rounded-[10px] border border-line" role="table">
              <div className="flex gap-[12px] bg-soft px-[14px] py-[10px] text-cap font-semibold text-mid uppercase" role="row">
                <span className="w-[210px] shrink-0">Topic</span>
                <span className="w-[150px] shrink-0">People affected</span>
                <span className="w-[180px] shrink-0">Signal</span>
                <span className="w-[230px] shrink-0">Suggested fix</span>
              </div>
              {data.gaps.map((gap) => (
                <div
                  key={gap.topic}
                  role="row"
                  className="flex items-center gap-[12px] border-b border-line px-[14px] py-[11px] last:border-b-0"
                >
                  <span className="w-[210px] shrink-0 text-body font-medium text-ink">{gap.topic}</span>
                  <span className="flex w-[150px] shrink-0 items-center gap-[8px]">
                    <span
                      className="h-[9px] shrink-0 rounded-full bg-teal-700"
                      style={{ width: Math.round(gap.affected * AFFECTED_PX_PER_PERSON) }}
                    />
                    <span className="text-small whitespace-nowrap text-mid">
                      {gap.affected} of {data.activeEmployees}
                    </span>
                  </span>
                  <span className="flex w-[180px] shrink-0">
                    <Chip label={gap.signal} tone={gap.tone} />
                  </span>
                  <span className="w-[230px] shrink-0 text-small text-mid">{gap.fix}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="w-[420px] shrink-0 gap-[14px] self-stretch">
            <SectionHeader title="Where you rank" subtitle="Percentile vs 214 peers" />
            <PercentileColumns items={data.rank} size="md" />
            <div className="flex items-start gap-[9px] rounded-[8px] bg-soft px-[13px] py-[11px]">
              <span className="mt-[4px] size-[8px] shrink-0 rounded-full bg-olive" />
              <p className="min-w-0 flex-1 text-small text-mid">{data.rankNote}</p>
            </div>
          </Panel>
        </div>

        <div className="flex w-full items-start gap-[18px]">
          <Panel className="min-w-0 flex-1 gap-[12px] self-stretch">
            <SectionHeader
              title="Needs your decision"
              subtitle={`${data.decisions.length} fields are published as disputed until you resolve them`}
              action={<Button kind="dark">Resolve all</Button>}
            />
            {data.decisions.map((item) => (
              <div key={item.title} className="flex items-start gap-[16px] rounded-[10px] border border-line bg-softer px-[16px] py-[14px]">
                <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                  <div className="flex items-center gap-[9px]">
                    <Chip label={item.kind} tone={item.tone} />
                    <p className="text-body font-medium text-ink">{item.title}</p>
                  </div>
                  <p className="text-small text-mid">{item.body}</p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-[7px]">
                  <Button kind="dark">{item.action}</Button>
                  <Button kind="ghost">See sources</Button>
                </div>
              </div>
            ))}
          </Panel>

          <section className="flex w-[420px] shrink-0 flex-col gap-[10px] self-stretch rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
            <SectionHeader
              title="What this page never shows you"
              action={<img src={infoTealIcon} alt="More information" width={14} height={14} className="shrink-0" />}
            />
            <ul className="flex flex-col gap-[10px]">
              {data.neverShown.map((text) => (
                <li key={text} className="flex items-start gap-[9px] pt-[5px]">
                  <img src={crossIcon} alt="" width={13} height={13} className="shrink-0" />
                  <p className="min-w-0 flex-1 text-small text-mid">{text}</p>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-[3px] rounded-[8px] bg-surface px-[13px] py-[12px]">
              <p className="text-body font-medium text-ink">This is the point, not a limitation.</p>
              <p className="text-small text-mid">
                Employees answer honestly because they know you cannot see them individually. That honesty is what makes
                these numbers worth anything to you.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
