import { useEffect, useState, type FormEvent } from 'react'
import { contentApi } from '../../api'
import type { OfferCorrection } from '../../api/mock/db'
import { offerMatchTiers, sampleOffer } from '../../data/offer'
import { employerMatchPercent, maxMatchPercent } from '../../lib/benefits'
import { daysBetween, formatDate, icsFor, localToday, type OfferMilestone, type OfferState, type OfferTask } from '../../lib/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Chip } from '../Chip'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import { useToast } from '../Toast'
import { OfferBenefitCards, SourceLink, offerPath } from './OfferParts'

type View = { state: OfferState; tasks: OfferTask[]; milestones: OfferMilestone[]; corrections: OfferCorrection[] }

const dueLabel = (t: OfferTask) => (t.due ? `Due ${formatDate(t.due)}` : t.undatedLabel)

function addToCalendar(task: OfferTask & { due: string }) {
  const url = URL.createObjectURL(new Blob([icsFor(task)], { type: 'text/calendar' }))
  Object.assign(document.createElement('a'), { href: url, download: `${task.id}.ics` }).click()
  URL.revokeObjectURL(url)
  track('calendar_added', task.id)
}

/** My benefits after acceptance: next action, tasks with persisted completion, and the offer's cards. */
export function OfferTracker({ initial }: { initial: View }) {
  const toast = useToast()
  const [view, setView] = useState(initial)
  const { state, tasks, milestones } = view
  const today = localToday()
  const open = tasks.filter((t) => !t.done)
  const next = open.find((t) => t.due) ?? open[0]
  const done = tasks.length - open.length

  useEffect(() => track('dashboard_viewed'), [])

  const toggle = async (task: OfferTask) => {
    const before = view
    setView({ ...view, tasks: tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)) }) // optimistic
    try {
      setView(await contentApi.setOfferTaskDone(task.id, !task.done))
      track(task.done ? 'task_reopened' : 'task_done', task.id)
      toast(task.done ? `Reopened: ${task.title}` : `Marked done: ${task.title}`)
    } catch {
      setView(before)
      toast('Could not update the task. Try again.', 'info')
    }
  }

  return (
    <div className="flex w-full flex-col gap-[14px]">
      <div className="flex items-center gap-[10px]">
        <SectionHeader
          title={`Your ${sampleOffer.employer} offer`}
          subtitle={`Accepted · starts ${state.startDate ? formatDate(state.startDate) : 'date not set'} · ${sampleOffer.planYear} plan v${sampleOffer.planVersion}`}
          action={<Chip label={sampleOffer.label} tone="flag" />}
        />
        <Button kind="ghost" to={`${offerPath}#accept`}>
          Change start date
        </Button>
      </div>

      <div className="flex w-full items-start gap-[18px]">
        <div className="flex w-[390px] shrink-0 flex-col gap-[6px] self-stretch rounded-[12px] border border-green bg-green-50 px-[18px] py-[16px]">
          <span className="text-cap font-semibold text-t-green uppercase">Next action</span>
          {next ? (
            <>
              <span className="text-h2 font-semibold text-ink">{next.title}</span>
              <span className="text-body font-medium text-t-green">{dueLabel(next)}</span>
              <span className="text-small text-mid">{next.why}</span>
              {next.sectionId && <SourceLink sectionId={next.sectionId} />}
              {next.due && (
                <Button kind="secondary" onClick={() => addToCalendar({ ...next, due: next.due! })} className="mt-[6px] self-start">
                  Add to calendar
                </Button>
              )}
            </>
          ) : (
            <span className="text-body font-medium text-ink">All caught up. Nothing open right now.</span>
          )}
        </div>

        <Panel className="min-w-0 flex-1 gap-[10px]">
          <SectionHeader title="Onboarding tasks" subtitle={`${done} of ${tasks.length} done`} />
          <div className="h-[8px] w-full overflow-hidden rounded-full bg-shade" role="progressbar" aria-valuenow={done} aria-valuemax={tasks.length}>
            <div className="h-full rounded-full bg-green" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
          </div>
          <ul className="flex flex-col">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-[12px] border-b border-line py-[11px] last:border-b-0">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggle(task)}
                  aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
                  className="size-[16px] shrink-0 cursor-pointer accent-green"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className={`text-body font-medium ${task.done ? 'text-light line-through' : 'text-ink'}`}>{task.title}</span>
                  <span className="text-small text-light">{task.why}</span>
                  {task.sectionId && <SourceLink sectionId={task.sectionId} />}
                </div>
                {!task.done && task.due && (
                  <button type="button" aria-label={`Add "${task.title}" to calendar`} onClick={() => addToCalendar({ ...task, due: task.due! })} className="cursor-pointer text-small font-medium text-t-link hover:underline">
                    Add to calendar
                  </button>
                )}
                {task.done ? <Chip label="Done" tone="verified" /> : <Chip label={dueLabel(task)} tone={task.due ? 'flag' : 'muted'} />}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex w-full items-start gap-[18px]">
        <Panel className="min-w-0 flex-1 gap-[10px] self-stretch">
          <SectionHeader title="When your benefits become usable" subtitle="Dates follow from your start date and the plan" />
          <ul className="flex flex-col">
            {milestones.map((m) => {
              const days = m.date ? daysBetween(today, m.date) : null
              return (
                <li key={m.id} className="flex items-center gap-[12px] border-b border-line py-[11px] last:border-b-0">
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <span className="text-body font-medium text-ink">{m.title}</span>
                    <span className="text-small text-light">{m.why}</span>
                    <SourceLink sectionId={m.sectionId} />
                  </div>
                  {m.date === null || days === null ? (
                    <Chip label="Check with HR" tone="muted" />
                  ) : days <= 0 ? (
                    <Chip label={`Available since ${formatDate(m.date)}`} tone="verified" />
                  ) : (
                    <Chip label={`${formatDate(m.date)} · in ${days} day${days === 1 ? '' : 's'}`} tone="teal" />
                  )}
                </li>
              )
            })}
          </ul>
        </Panel>
        <MatchCapture percent={state.contributionPercent} onSave={async (p) => setView(await contentApi.setContribution(p))} />
      </div>

      <OfferBenefitCards corrections={view.corrections} />
    </div>
  )
}

/** Whether what you contribute captures the full match. Percent of pay only, so no salary is needed. */
function MatchCapture({ percent, onSave }: { percent: number | null; onSave: (percent: number) => Promise<void> }) {
  const toast = useToast()
  const [draft, setDraft] = useState(percent === null ? '' : String(percent))
  const full = maxMatchPercent(offerMatchTiers)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const value = Number(draft)
    if (draft.trim() === '' || !Number.isFinite(value) || value < 0 || value > 100) return toast('Enter a percent between 0 and 100', 'info')
    await onSave(value)
    track('contribution_set')
    toast('Saved')
  }

  const got = percent === null ? null : employerMatchPercent(offerMatchTiers, percent)
  return (
    <Panel className="w-[390px] shrink-0 gap-[12px] self-stretch">
      <SectionHeader title="401(k) match" subtitle={`${sampleOffer.employer} adds up to ${full}% of pay`} />
      <form onSubmit={save} className="flex items-end gap-[8px]">
        <label className="flex flex-col gap-[5px] text-small font-medium text-mid">
          You contribute (% of pay)
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-[120px] rounded-[8px] border border-line-strong bg-surface px-[12px] py-[9px] text-body text-ink outline-none focus:border-green"
          />
        </label>
        <Button type="submit">Save</Button>
      </form>
      {got === null ? (
        <p className="text-small text-light">Add what you chose at enrollment to see if you get the full match.</p>
      ) : got >= full ? (
        <div>
          <Chip label={`Getting the full ${full}% match`} tone="verified" />
        </div>
      ) : (
        <p className="text-body font-medium text-t-amber">
          Getting {got}% of a possible {full}%. Contributing {full}% would capture the rest.
        </p>
      )}
      <SourceLink sectionId="employer-match" />
    </Panel>
  )
}
