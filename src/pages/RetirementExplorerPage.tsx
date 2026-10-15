import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import documentIcon from '../assets/icons/document.svg'
import { contentApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Loaded } from '../components/Loaded'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { useToast } from '../components/Toast'
import { ContributionSlider } from '../components/retirement/ContributionSlider'
import { MatchCurve } from '../components/retirement/MatchCurve'
import type { MatchTier, RetirementExplorer, Stat } from '../data/mock'
import { useApi } from '../hooks/useApi'
import { describeMatchRule, employerMatchPercent, matchCapPercent, maxMatchPercent, usd } from '../lib/benefits'

export function RetirementExplorerPage() {
  const state = useApi(() => contentApi.getRetirementExplorer(), [])
  return (
    <PageShell activeTab="my-benefits" bare>
      <main className="flex w-full flex-col gap-[18px] px-[40px] pt-[20px] pb-[44px]">
        <Loaded state={state}>{(data) => <RetirementContent data={data} />}</Loaded>
      </main>
    </PageShell>
  )
}

type Data = RetirementExplorer & { matchTiers: MatchTier[] }

function RetirementContent({ data }: { data: Data }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [contribution, setContribution] = useState(data.contributionPercent)
  const [salary, setSalary] = useState(data.baseSalary)
  const [editingSalary, setEditingSalary] = useState(false)
  const [showRothDetail, setShowRothDetail] = useState(false)

  const employer = data.employerShortName
  const tiers = data.matchTiers
  const cap = matchCapPercent(tiers)
  const dollars = (percent: number) => (percent / 100) * salary
  const employerAt = (percent: number) => dollars(employerMatchPercent(tiers, percent))
  const fullMatch = dollars(maxMatchPercent(tiers))

  const yours = dollars(contribution)
  const theirs = employerAt(contribution)
  const leftBehind = fullMatch - theirs
  const perPaycheck = yours / data.paychecksPerYear

  const stats: Stat[] = [
    { label: 'You contribute', value: usd.format(yours), sub: `${contribution}% of ${usd.format(salary)}, ~${usd.format(perPaycheck)} a paycheck` },
    {
      label: `${employer} adds`,
      value: usd.format(theirs),
      sub: leftBehind > 0 ? `${usd.format(leftBehind)} of match left unclaimed` : `the full match — you are at or above ${cap}%`,
      tone: 'highlight',
    },
    { label: 'Into your account', value: usd.format(yours + theirs), sub: "before any growth, which we don't predict" },
    { label: 'Yours if you left today', value: usd.format(yours), sub: `their match vests over ${data.vestingYears} years` },
  ]

  const insight =
    contribution < cap
      ? {
          title: `Raise to ${cap}% and ${employer} adds ${usd.format(fullMatch - theirs)} more a year.`,
          sub: `Below ${cap}%, every extra percent you put in is matched.`,
        }
      : {
          title: `Drop to 3% and ${employer}'s share falls to ${usd.format(employerAt(3))} — ${usd.format(theirs - employerAt(3))} a year less.`,
          sub: `Anything above ${cap}% is all yours. Still saved, just not matched.`,
        }

  const scenarioPercents = [...new Set([3, cap, contribution, 10])].sort((a, b) => a - b)

  const saveToPlan = async () => {
    await contentApi.addAction({
      title: `Set your 401(k) contribution to ${contribution}%`,
      detail: `${usd.format(yours)} from you and ${usd.format(theirs)} from ${employer} a year.`,
      system: data.handoff.system,
      systemUrl: data.handoff.url,
    })
    toast('Added to your action plan')
  }

  return (
    <>
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

      <StatTileRow stats={stats} />

      <div className="flex w-full items-start gap-[18px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
          <Panel className="gap-[18px]">
            <SectionHeader
              title="Your contribution"
              subtitle={`${employer}'s share stops growing after ${cap}%`}
              action={
                <span className="flex shrink-0 items-center gap-[6px] rounded-full bg-green-50 px-[12px] py-[6px] text-t-green">
                  <span className="text-num-m font-semibold">{contribution}%</span>
                  <span className="text-small">of pay</span>
                </span>
              }
            />
            <ContributionSlider value={contribution} onChange={setContribution} matchCapPercent={cap} maxPercent={data.maxContributionPercent} />
            <MatchCurve tiers={tiers} baseSalary={salary} contributionPercent={contribution} matchCapPercent={cap} />

            <div className="flex w-full items-center gap-[11px] rounded-[8px] bg-green-50 px-[16px] py-[12px]" aria-live="polite">
              <span className="size-[9px] shrink-0 rounded-full bg-green" />
              <div className="flex min-w-0 flex-col gap-px">
                <p className="text-body font-medium text-ink">{insight.title}</p>
                <p className="text-small text-mid">{insight.sub}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-line" role="table">
              <div className="flex bg-soft px-[16px] py-[11px] text-cap font-semibold text-mid uppercase" role="row">
                {['You contribute', 'From your pay', `${employer} adds`, 'Total saved', 'Match left behind'].map((h) => (
                  <span key={h} className="flex-1" role="columnheader">
                    {h}
                  </span>
                ))}
              </div>
              {scenarioPercents.map((p) => {
                const current = p === contribution
                const missed = fullMatch - employerAt(p)
                return (
                  <button
                    key={p}
                    type="button"
                    role="row"
                    onClick={() => setContribution(p)}
                    className={`flex w-full cursor-pointer px-[16px] py-[11px] text-left text-body ${
                      current ? 'bg-green-50 font-medium text-t-green' : 'bg-surface text-mid hover:bg-softer'
                    }`}
                  >
                    <span className="flex-1">{current ? `${p}% — your scenario` : `${p}%`}</span>
                    <span className="flex-1">{usd.format(dollars(p))}</span>
                    <span className="flex-1">{usd.format(employerAt(p))}</span>
                    <span className="flex-1">{usd.format(dollars(p) + employerAt(p))}</span>
                    <span className="flex-1">{missed > 0 ? usd.format(missed) : 'nothing'}</span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <section className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
            <SectionHeader title="What these numbers deliberately do not tell you" action={<Chip label="Out of scope" tone="muted" />} />
            <div className="flex gap-[18px]">
              {data.outOfScope.map((item) => (
                <div key={item.title} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <p className="text-body font-medium text-ink">{item.title}</p>
                  <p className="text-small text-mid">{item.body.replace('$288', usd.format(perPaycheck)).replace('6%', `${contribution}%`)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex w-[406px] shrink-0 flex-col gap-[16px]">
          <section className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-softer px-[20px] pt-[18px] pb-[20px]">
            <div className="flex items-center gap-[8px]">
              <Chip label="Education" tone="teal" />
              <h2 className="text-h2 font-semibold whitespace-nowrap text-ink">Inside your {employer} plan</h2>
            </div>
            <p className="text-small text-mid">You can split your {contribution}% between two kinds of contribution. The match is identical either way.</p>
            {data.planOptions.map((option) => (
              <div key={option.title} className="flex flex-col gap-[3px] rounded-[8px] border border-line bg-surface px-[13px] py-[11px]">
                <p className="text-body font-medium text-ink">{option.title}</p>
                <p className="text-small text-mid">{option.body}</p>
              </div>
            ))}
            <p className="text-small text-light">Which is better depends on your tax situation now versus later. We will not guess that for you.</p>
          </section>

          <section className="flex flex-col items-start gap-[9px] rounded-[12px] border-2 border-dashed border-line-strong bg-surface px-[18px] py-[16px]">
            <Chip label="Not an employer benefit" tone="muted" />
            <h2 className="text-h2 font-semibold text-ink">A Roth IRA is a different thing</h2>
            <p className="text-small text-mid">
              Same word, different account. A Roth IRA is personal — you open it yourself at a bank or broker. {employer} does not offer it, does
              not match it, and is not involved. We keep it behind this line so the two never blur.
            </p>
            {showRothDetail && <p className="rounded-[8px] bg-soft px-[12px] py-[10px] text-small text-mid">{data.rothIraDetail}</p>}
            <Button kind="ghost" onClick={() => setShowRothDetail((v) => !v)} aria-expanded={showRothDetail}>
              {showRothDetail ? 'Show less' : 'Learn the difference →'}
            </Button>
          </section>

          <section className="flex flex-col gap-[10px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
            <div className="flex items-center gap-[8px]">
              <h2 className="text-h2 font-semibold text-ink">What this assumes</h2>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setEditingSalary((v) => !v)}
                className="cursor-pointer text-small font-medium text-t-link hover:underline"
              >
                {editingSalary ? 'Done' : 'Edit'}
              </button>
            </div>
            <dl className="flex flex-col gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <dt className="w-[74px] shrink-0 text-cap font-semibold whitespace-nowrap text-light uppercase">Salary</dt>
                <dd className="min-w-0 flex-1 text-small text-mid">
                  {editingSalary ? (
                    <input
                      type="number"
                      min={20000}
                      step={1000}
                      value={salary}
                      autoFocus
                      aria-label="Base salary"
                      onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingSalary(false)}
                      className="w-[140px] rounded-[6px] border border-line-strong bg-surface px-[8px] py-[4px] text-small text-ink outline-none focus:border-green"
                    />
                  ) : (
                    `${usd.format(salary)} — ${salary === data.baseSalary ? 'from your offer letter' : 'edited by you'}`
                  )}
                </dd>
              </div>
              {[
                ['Paychecks', `${data.paychecksPerYear} a year, every two weeks`],
                ['Amounts', 'Gross. No tax, growth or fees applied'],
                ['Plan year', '2026. Annual IRS limits are not modelled'],
                ['Match rule', describeMatchRule(tiers)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-[10px]">
                  <dt className="w-[74px] shrink-0 text-cap font-semibold whitespace-nowrap text-light uppercase">{label}</dt>
                  <dd className="min-w-0 flex-1 text-small text-mid">{value}</dd>
                </div>
              ))}
            </dl>
            <Link to={`/companies/${data.companyId}?tab=retirement`} className="flex items-center gap-[7px] rounded-[8px] bg-surface px-[11px] py-[9px] hover:bg-softer">
              <img src={documentIcon} alt="" width={13} height={13} className="shrink-0" />
              <span className="min-w-0 flex-1 text-small text-t-link">{data.source}</span>
            </Link>
          </section>

          <Panel className="gap-[10px]">
            <h2 className="text-h2 font-semibold text-ink">What to do with this</h2>
            <a
              href={data.handoff.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => toast(`Opening ${data.handoff.system} — set ${contribution}% there`, 'info')}
              className="inline-flex w-full cursor-pointer items-center rounded-[8px] bg-green px-[16px] py-[9px] text-body font-medium text-on-dark hover:bg-t-green"
            >
              Set {contribution}% in Fidelity ↗
            </a>
            <Button className="w-full" onClick={saveToPlan}>
              Save to my action plan
            </Button>
            <Button
              kind="ghost"
              className="w-full"
              onClick={() => navigate(`/community?ask=${data.companyId}&topic=${encodeURIComponent('How does the 401(k) match vesting work?')}`)}
            >
              Ask People Ops about vesting
            </Button>
            <p className="text-small text-light">Changes happen in Fidelity, not here. We never submit anything on your behalf.</p>
          </Panel>
        </aside>
      </div>
    </>
  )
}
