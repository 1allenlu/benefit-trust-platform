import { useState } from 'react'
import crossIcon from '../assets/icons/cross-dark.svg'
import infoTealIcon from '../assets/icons/info-teal.svg'
import { contentApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { EmployerTopNav } from '../components/EmployerTopNav'
import { Loaded } from '../components/Loaded'
import { Modal } from '../components/Modal'
import { Panel } from '../components/Panel'
import { PercentileColumns } from '../components/PercentileColumns'
import { SectionHeader } from '../components/SectionHeader'
import { StatTileRow } from '../components/StatTile'
import { useToast } from '../components/Toast'
import { CompletenessRing } from '../components/employer/CompletenessRing'
import { ResolveModal } from '../components/employer/ResolveModal'
import type { EmployerDecision } from '../data/mock'
import { useApi } from '../hooks/useApi'

type DashboardData = Awaited<ReturnType<typeof contentApi.getEmployerDashboard>>

/** "People affected" bar length per employee (42 → 76px). */
const AFFECTED_PX_PER_PERSON = 1.8

const METHOD = [
  'Understanding signals come from what employees do on Vested: which explanations they re-read, which questions they ask, and which quiz answers they miss.',
  'Every figure is aggregate, with a minimum of 10 employees. Smaller groups read "Insufficient data". There is no employee-level view, including for admins.',
  'Benchmarks compare your published, documented fields with 214 peer employers. Unknown fields are left out, never scored as zero.',
]

export function EmployerDashboardPage() {
  const state = useApi(() => contentApi.getEmployerDashboard(), [])
  const [tab, setTab] = useState('Dashboard')
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Loaded state={state}>
        {(data) => (
          <>
            <EmployerTopNav tabs={data.tabs} activeTab={tab} onTabChange={setTab} orgLabel={data.org} />
            <EmployerContent data={data} tab={tab} onChanged={state.retry} />
          </>
        )}
      </Loaded>
    </div>
  )
}

function EmployerContent({ data, tab, onChanged }: { data: DashboardData; tab: string; onChanged: () => void }) {
  const toast = useToast()
  const [resolving, setResolving] = useState<EmployerDecision>()
  const [resolveAll, setResolveAll] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const { sourceSplit, fields } = data
  const show = (section: 'decisions' | 'gaps' | 'rank' | 'responses') =>
    tab === 'Dashboard'
      ? section !== 'responses'
      : { 'Benefits profile': 'decisions', Understanding: 'gaps', Benchmarks: 'rank', 'Community responses': 'responses' }[tab] === section

  const resolve = async (decision: EmployerDecision, value: string) => {
    await contentApi.resolveDecision(decision.id, value)
    toast(`Published: ${decision.title.toLowerCase()} resolved`)
    const done = [...resolvedIds, decision.id]
    setResolvedIds(done)
    const next = data.decisions.find((d) => !done.includes(d.id))
    setResolving(resolveAll && next ? next : undefined)
    if (!next) setResolveAll(false)
    onChanged()
  }

  return (
    <main className="flex w-full flex-col gap-[18px] px-[40px] pt-[22px] pb-[44px]">
      <div className="flex w-full items-start gap-[20px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <h1 className="text-h1 font-bold text-ink">{data.title}</h1>
          <p className="text-body text-mid">{data.intro}</p>
          <p className="flex items-center gap-[8px] text-small whitespace-nowrap">
            <span className="text-light">{data.asOf}</span>
            <button type="button" onClick={() => setExplaining(true)} className="cursor-pointer font-medium text-t-link hover:underline">
              How these numbers are produced
            </button>
          </p>
        </div>
        <div className="flex w-[400px] shrink-0 items-center gap-[14px] rounded-[12px] bg-teal-100 py-[16px] pr-[20px] pl-[18px]">
          <CompletenessRing ratio={fields.published / fields.total} />
          <div className="flex min-w-0 flex-col gap-[2px] whitespace-nowrap text-t-teal">
            <span className="text-small">Profile completeness</span>
            <span className="text-num-xl font-bold">{Math.round((fields.published / fields.total) * 100)}%</span>
            <span className="text-small">
              {fields.published} of {fields.total} fields published with a source
            </span>
          </div>
        </div>
      </div>

      <StatTileRow stats={data.stats} />

      <div className="flex w-full flex-col gap-[6px]">
        <div className="flex items-center gap-[8px] text-small whitespace-nowrap">
          <span className="font-medium text-mid">Published fields by source</span>
          <div className="flex-1" />
          <span className="text-light">
            {sourceSplit.documents}% plan documents · {sourceSplit.reports}% employee reports · {sourceSplit.undocumented}% not documented
          </span>
        </div>
        <div className="flex h-[12px] w-full gap-[2px] overflow-hidden rounded-full">
          <span className="h-full rounded-full bg-teal-900" style={{ flexGrow: sourceSplit.documents }} />
          <span className="h-full rounded-full bg-olive-300" style={{ flexGrow: sourceSplit.reports }} />
          <span className="h-full rounded-full bg-shade" style={{ flexGrow: sourceSplit.undocumented }} />
        </div>
      </div>

      {(show('gaps') || show('rank')) && (
        <div className="flex w-full items-start gap-[18px]">
          {show('gaps') && <GapsPanel data={data} />}
          {show('rank') && <RankPanel data={data} wide={tab !== 'Dashboard'} />}
        </div>
      )}

      {show('decisions') && (
        <div className="flex w-full items-start gap-[18px]">
          <Panel className="min-w-0 flex-1 gap-[12px] self-stretch">
            <SectionHeader
              title="Needs your decision"
              subtitle={
                data.decisions.length
                  ? `${data.decisions.length} ${data.decisions.length === 1 ? 'field is' : 'fields are'} published as disputed until you resolve them`
                  : 'Nothing blocking — your profile publishes clean'
              }
              action={
                data.decisions.length > 0 && (
                  <Button
                    kind="dark"
                    onClick={() => {
                      setResolveAll(true)
                      setResolving(data.decisions[0])
                    }}
                  >
                    Resolve all
                  </Button>
                )
              }
            />
            {data.decisions.map((item) => (
              <DecisionCard key={item.id} item={item} onResolve={() => setResolving(item)} />
            ))}
            {data.decisions.length === 0 && (
              <div className="flex items-center gap-[10px] rounded-[10px] bg-green-50 px-[16px] py-[14px]">
                <Chip label="All clear" tone="verified" />
                <p className="text-body text-ink">{data.resolvedCount} decisions resolved and published with today's date.</p>
              </div>
            )}
          </Panel>
          <BoundaryPanel neverShown={data.neverShown} />
        </div>
      )}

      {show('responses') && <ResponsesPanel questions={data.questions} onAnswered={onChanged} />}

      {resolving && (
        <ResolveModal
          key={resolving.id}
          decision={resolving}
          remaining={data.decisions.filter((d) => !resolvedIds.includes(d.id)).length}
          onResolve={(value) => resolve(resolving, value)}
          onClose={() => {
            setResolving(undefined)
            setResolveAll(false)
          }}
        />
      )}

      {explaining && (
        <Modal title="How these numbers are produced" onClose={() => setExplaining(false)}>
          <div className="flex flex-col gap-[10px]">
            {METHOD.map((p) => (
              <p key={p} className="text-body text-mid">
                {p}
              </p>
            ))}
          </div>
          <Button kind="dark" onClick={() => setExplaining(false)} className="self-start">
            Got it
          </Button>
        </Modal>
      )}
    </main>
  )
}

function DecisionCard({ item, onResolve }: { item: EmployerDecision; onResolve: () => void }) {
  const [showSources, setShowSources] = useState(false)
  return (
    <div className="flex items-start gap-[16px] rounded-[10px] border border-line bg-softer px-[16px] py-[14px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-center gap-[9px]">
          <Chip label={item.kind} tone={item.tone} />
          <p className="text-body font-medium text-ink">{item.title}</p>
        </div>
        <p className="text-small text-mid">{item.body}</p>
        {showSources && (
          <ul className="mt-[4px] flex flex-col gap-[4px] rounded-[8px] bg-surface px-[12px] py-[9px]">
            {item.sources.map((source) => (
              <li key={source} className="text-small text-mid">
                · {source}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-[7px]">
        <Button kind="dark" onClick={onResolve}>
          {item.action}
        </Button>
        <Button kind="ghost" onClick={() => setShowSources((v) => !v)} aria-expanded={showSources}>
          {showSources ? 'Hide sources' : 'See sources'}
        </Button>
      </div>
    </div>
  )
}

function GapsPanel({ data }: { data: DashboardData }) {
  return (
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
          <div key={gap.topic} role="row" className="flex items-center gap-[12px] border-b border-line px-[14px] py-[11px] last:border-b-0">
            <span className="w-[210px] shrink-0 text-body font-medium text-ink">{gap.topic}</span>
            <span className="flex w-[150px] shrink-0 items-center gap-[8px]">
              <span className="h-[9px] shrink-0 rounded-full bg-teal-700" style={{ width: Math.round(gap.affected * AFFECTED_PX_PER_PERSON) }} />
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
  )
}

function RankPanel({ data, wide }: { data: DashboardData; wide: boolean }) {
  return (
    <Panel className={`${wide ? 'w-full' : 'w-[420px] shrink-0'} gap-[14px] self-stretch`}>
      <SectionHeader title="Where you rank" subtitle="Percentile vs 214 peers" />
      <PercentileColumns items={data.rank} size="md" />
      <div className="flex items-start gap-[9px] rounded-[8px] bg-soft px-[13px] py-[11px]">
        <span className="mt-[4px] size-[8px] shrink-0 rounded-full bg-olive" />
        <p className="min-w-0 flex-1 text-small text-mid">{data.rankNote}</p>
      </div>
    </Panel>
  )
}

function BoundaryPanel({ neverShown }: { neverShown: string[] }) {
  return (
    <section className="flex w-[420px] shrink-0 flex-col gap-[10px] self-stretch rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
      <SectionHeader
        title="What this page never shows you"
        action={
          <span title="Privacy is the product: employees answer honestly because they can't be seen individually." className="shrink-0 cursor-help">
            <img src={infoTealIcon} alt="More information" width={14} height={14} />
          </span>
        }
      />
      <ul className="flex flex-col gap-[10px]">
        {neverShown.map((text) => (
          <li key={text} className="flex items-start gap-[9px] pt-[5px]">
            <img src={crossIcon} alt="" width={13} height={13} className="shrink-0" />
            <p className="min-w-0 flex-1 text-small text-mid">{text}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-[3px] rounded-[8px] bg-surface px-[13px] py-[12px]">
        <p className="text-body font-medium text-ink">This is the point, not a limitation.</p>
        <p className="text-small text-mid">
          Employees answer honestly because they know you cannot see them individually. That honesty is what makes these numbers worth anything to you.
        </p>
      </div>
    </section>
  )
}

function ResponsesPanel({ questions, onAnswered }: { questions: DashboardData['questions']; onAnswered: () => void }) {
  const toast = useToast()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string>()
  const open = questions.filter((q) => !q.employerAnswer)

  const answer = async (postId: string) => {
    const body = drafts[postId]?.trim()
    if (!body) return
    setSaving(postId)
    await contentApi.answerQuestion(postId, body)
    setSaving(undefined)
    toast('Answer published on the record — badged and dated in Community')
    onAnswered()
  }

  return (
    <Panel className="w-full gap-[14px]">
      <SectionHeader
        title="Community responses"
        subtitle={`${open.length} open ${open.length === 1 ? 'question' : 'questions'} about Northstar · answers are public, badged as an employer answer and dated`}
        action={<Chip label="Never anonymous" tone="teal" />}
      />
      {questions.map((q) => (
        <div key={q.id} className="flex flex-col gap-[10px] rounded-[10px] border border-line bg-softer px-[16px] py-[14px]">
          <div className="flex items-center gap-[9px]">
            <Chip label={q.employerAnswer ? 'Answered' : 'Open'} tone={q.employerAnswer ? 'verified' : 'default'} />
            <p className="text-body font-medium text-ink">{q.title}</p>
            <div className="flex-1" />
            <span className="text-small text-light">{q.meta}</span>
          </div>
          {q.body && <p className="text-small text-mid">{q.body}</p>}
          {q.employerAnswer ? (
            <p className="rounded-[8px] border border-green bg-green-50 px-[12px] py-[9px] text-body text-ink">{q.employerAnswer.body}</p>
          ) : (
            <div className="flex flex-col gap-[8px]">
              <textarea
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                rows={3}
                aria-label={`Answer: ${q.title}`}
                placeholder="Answer as Northstar People Ops. Cite the document if you can."
                className="w-full resize-y rounded-[8px] border border-line-strong bg-surface px-[12px] py-[9px] text-body text-ink outline-none placeholder:text-light focus:border-teal-900"
              />
              <Button kind="dark" onClick={() => answer(q.id)} disabled={!drafts[q.id]?.trim() || saving === q.id} className="self-start disabled:opacity-50">
                {saving === q.id ? 'Publishing…' : 'Answer on the record'}
              </Button>
            </div>
          )}
        </div>
      ))}
    </Panel>
  )
}
