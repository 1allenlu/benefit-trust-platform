import { Chip } from './Chip'
import { Panel } from './Panel'

type ChipRowProps = {
  label: string
  options: string[]
  selected: string
  onSelect: (value: string) => void
}

function ChipRow({ label, options, selected, onSelect }: ChipRowProps) {
  return (
    <div className="flex w-full items-start gap-[8px]" role="group" aria-label={label}>
      <div className="flex min-w-0 flex-1 flex-wrap gap-[8px]">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            tone={option === selected ? 'active' : 'default'}
            onClick={() => onSelect(option)}
          />
        ))}
      </div>
      <button type="button" className="shrink-0 cursor-pointer text-small font-medium text-t-link hover:underline">
        More ›
      </button>
    </div>
  )
}

type ExploreFiltersProps = {
  industries: string[]
  roles: string[]
  industry: string
  role: string
  onIndustryChange: (value: string) => void
  onRoleChange: (value: string) => void
}

export function ExploreFilters({ industries, roles, industry, role, onIndustryChange, onRoleChange }: ExploreFiltersProps) {
  return (
    <Panel className="w-full gap-[12px]">
      <ChipRow label="Industry" options={industries} selected={industry} onSelect={onIndustryChange} />
      <div className="h-px w-full bg-line" />
      <ChipRow label="Role" options={roles} selected={role} onSelect={onRoleChange} />
    </Panel>
  )
}
