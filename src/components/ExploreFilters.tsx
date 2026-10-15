import { useState } from 'react'
import { Chip } from './Chip'
import { Panel } from './Panel'

type ChipRowProps = {
  label: string
  options: string[]
  /** Extra options revealed by "More ›". */
  more: string[]
  /** null = no filter on this row. */
  selected: string | null
  onSelect: (value: string | null) => void
}

function ChipRow({ label, options, more, selected, onSelect }: ChipRowProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded || (selected && more.includes(selected)) ? [...options, ...more] : options

  return (
    <div className="flex w-full items-start gap-[8px]" role="group" aria-label={label}>
      <div className="flex min-w-0 flex-1 flex-wrap gap-[8px]">
        {visible.map((option) => (
          <Chip
            key={option}
            label={option}
            tone={option === selected ? 'active' : 'default'}
            onClick={() => onSelect(option === selected ? null : option)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="shrink-0 cursor-pointer text-small font-medium text-t-link hover:underline"
      >
        {expanded ? '‹ Less' : 'More ›'}
      </button>
    </div>
  )
}

type ExploreFiltersProps = {
  industries: string[]
  moreIndustries: string[]
  roles: string[]
  moreRoles: string[]
  industry: string | null
  role: string | null
  onIndustryChange: (value: string | null) => void
  onRoleChange: (value: string | null) => void
}

export function ExploreFilters({
  industries,
  moreIndustries,
  roles,
  moreRoles,
  industry,
  role,
  onIndustryChange,
  onRoleChange,
}: ExploreFiltersProps) {
  return (
    <Panel className="w-full gap-[12px]">
      <ChipRow label="Industry" options={industries} more={moreIndustries} selected={industry} onSelect={onIndustryChange} />
      <div className="h-px w-full bg-line" />
      <ChipRow label="Role" options={roles} more={moreRoles} selected={role} onSelect={onRoleChange} />
    </Panel>
  )
}
