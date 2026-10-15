import type { CompareColumn } from './types'
import { Chip } from '../Chip'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'

const segmentColors = ['bg-teal-900', 'bg-teal-700', 'bg-teal-500', 'bg-teal-300', 'bg-teal-100']

type ValueStackProps = {
  legend: string[]
  employers: CompareColumn[]
}

export function ValueStack({ legend, employers }: ValueStackProps) {
  return (
    <Panel className="w-full gap-[16px]">
      <SectionHeader
        title="Employer-paid benefits value"
        subtitle="Per year, excluding salary, bonus and equity"
        action={
          <ul className="flex shrink-0 items-center gap-[14px]">
            {legend.map((label, i) => (
              <li key={label} className="flex items-center gap-[6px] text-small font-medium whitespace-nowrap text-mid">
                <span className={`size-[8px] rounded-full ${segmentColors[i]}`} />
                {label}
              </li>
            ))}
          </ul>
        }
      />
      {employers.map((employer) => (
        <div key={employer.id} className="flex flex-col gap-[8px]">
          <div className="flex items-center gap-[9px]">
            <span className="size-[22px] shrink-0 rounded-[6px] bg-shade" />
            <span className="text-body font-medium text-ink">{employer.name}</span>
            {employer.isYours && <Chip label="Your offer" tone="verified" />}
            <div className="flex-1" />
            <span className="text-num-m font-semibold text-ink">{employer.totalValue}</span>
          </div>
          <div className="flex gap-[3px]">
            {employer.stack.map((width, i) => (
              <span
                key={legend[i]}
                title={legend[i]}
                className={`h-[30px] shrink-0 rounded-[4px] ${segmentColors[i]}`}
                style={{ width }}
              />
            ))}
          </div>
        </div>
      ))}
    </Panel>
  )
}
