import { Chip } from '../Chip'

export type Fact = {
  label: string
  value: string
  source: 'document' | 'report' | 'unknown'
  /** Caveat, e.g. "No documented minimum". */
  flag?: string
}

const sourceChip = {
  document: { label: 'Plan document', tone: 'verified' },
  report: { label: 'Employee report', tone: 'teal' },
  unknown: { label: 'Unknown', tone: 'muted' },
} as const

/** Label / value rows with where each fact came from. Policy and reports stay labelled apart. */
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="flex flex-col">
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-center gap-[12px] border-b border-line py-[11px] last:border-b-0">
          <dt className="w-[210px] shrink-0 text-body text-mid">{fact.label}</dt>
          <dd className={`min-w-0 flex-1 text-body font-medium ${fact.source === 'unknown' ? 'text-light' : 'text-ink'}`}>{fact.value}</dd>
          {fact.flag && <Chip label={fact.flag} tone="flag" />}
          <Chip label={sourceChip[fact.source].label} tone={sourceChip[fact.source].tone} />
        </div>
      ))}
    </dl>
  )
}
