import { useState } from 'react'
import { contentApi } from '../api'
import type { ActionItem } from '../data/mock'
import { Chip } from './Chip'
import { Panel } from './Panel'
import { SectionHeader } from './SectionHeader'
import { useToast } from './Toast'

type ActionPlanProps = {
  items: ActionItem[]
  onChange: (items: ActionItem[]) => void
}

/** What to do next, each item handing off to the system where it actually happens. */
export function ActionPlan({ items, onChange }: ActionPlanProps) {
  const toast = useToast()
  const [, setPending] = useState<string>()
  const open = items.filter((i) => !i.done).length

  const toggle = async (item: ActionItem) => {
    const done = !item.done
    onChange(items.map((i) => (i.id === item.id ? { ...i, done } : i))) // optimistic
    setPending(item.id)
    try {
      onChange(await contentApi.setActionDone(item.id, done))
      if (done) toast(`Marked done: ${item.title}`)
    } catch {
      onChange(items) // roll back
    } finally {
      setPending(undefined)
    }
  }

  return (
    <Panel className="w-full gap-[12px]">
      <SectionHeader
        title="Your action plan"
        subtitle={open ? `${open} to do · each one happens in the system named, not here` : 'All done — nothing open right now'}
        action={<Chip label="Education, not advice" tone="teal" />}
      />
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-[12px] border-b border-line py-[11px] last:border-b-0">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item)}
              aria-label={`Mark "${item.title}" as done`}
              className="size-[16px] shrink-0 cursor-pointer accent-green"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className={`text-body font-medium ${item.done ? 'text-light line-through' : 'text-ink'}`}>{item.title}</span>
              <span className="text-small text-light">{item.detail}</span>
            </div>
            {item.due && !item.done && <Chip label={`Due ${item.due}`} tone="flag" />}
            <a
              href={item.systemUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-[8px] border border-line-strong px-[12px] py-[6px] text-small font-medium text-ink hover:bg-soft"
            >
              Open {item.system} ↗
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
