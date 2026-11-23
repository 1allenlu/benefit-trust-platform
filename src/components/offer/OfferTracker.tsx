import { useEffect, useState } from 'react'
import { contentApi } from '../../api'
import { sampleOffer } from '../../data/offer'
import { formatDate, type OfferState, type OfferTask } from '../../lib/offer'
import { track } from '../../lib/research'
import { Button } from '../Button'
import { Chip } from '../Chip'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import { useToast } from '../Toast'
import { OfferBenefitCards, SourceLink, offerPath } from './OfferParts'

type View = { state: OfferState; tasks: OfferTask[] }

/** My benefits after acceptance: next action, tasks with persisted completion, and the offer's cards. */
export function OfferTracker({ initial }: { initial: View }) {
  const toast = useToast()
  const [view, setView] = useState(initial)
  const { state, tasks } = view
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
              <span className="text-body font-medium text-t-green">{next.due ? `Due ${formatDate(next.due)}` : 'Check with HR'}</span>
              <span className="text-small text-mid">{next.why}</span>
              {next.sectionId && <SourceLink sectionId={next.sectionId} />}
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
                {task.done ? (
                  <Chip label="Done" tone="verified" />
                ) : (
                  <Chip label={task.due ? `Due ${formatDate(task.due)}` : 'Check with HR'} tone={task.due ? 'flag' : 'muted'} />
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <OfferBenefitCards />
    </div>
  )
}
