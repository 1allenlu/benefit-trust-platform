import { Link } from 'react-router'
import type { CompareCell } from '../../data/mock'
import { Chip } from '../Chip'
import { InfoIcon } from '../InfoIcon'
import { Panel } from '../Panel'
import { SectionHeader } from '../SectionHeader'
import type { CompareColumn } from './types'

function Cell({ cell }: { cell: CompareCell }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[7px] whitespace-nowrap">
      {cell.best ? (
        <span className="rounded-[6px] bg-green-50 px-[9px] py-[3px] text-body font-medium text-t-green">{cell.text}</span>
      ) : (
        <span className={`text-body ${cell.muted ? 'text-light' : 'text-mid'}`}>{cell.text}</span>
      )}
      {cell.flag && <Chip label={cell.flag} tone="flag" />}
    </div>
  )
}

type BenefitMatrixProps = {
  employers: CompareColumn[]
  rows: { benefit: string; cells: CompareCell[] }[]
  onRemove?: (id: string) => void
}

export function BenefitMatrix({ employers, rows, onRemove }: BenefitMatrixProps) {
  return (
    <Panel className="w-full">
      <div className="pb-[14px]">
        <SectionHeader
          title="Benefit by benefit"
          subtitle="Green marks the strongest documented value in each row"
          action={<InfoIcon />}
        />
      </div>
      <div className="overflow-hidden rounded-[10px] border border-line" role="table">
        <div className="flex items-center bg-soft px-[16px] py-[11px]" role="row">
          <span className="w-[230px] shrink-0 text-cap font-semibold text-mid uppercase" role="columnheader">
            Benefit
          </span>
          {employers.map((employer) => (
            <div key={employer.id} className="flex min-w-0 flex-1 items-center gap-[7px] pr-[12px]" role="columnheader">
              <span className="size-[18px] shrink-0 rounded-[5px] bg-shade" />
              <Link to={`/companies/${employer.id}`} className="text-small font-medium whitespace-nowrap text-ink hover:underline">
                {employer.name}
              </Link>
              {employer.isYours && <Chip label="Yours" tone="verified" />}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(employer.id)}
                  aria-label={`Remove ${employer.name}`}
                  title={`Remove ${employer.name}`}
                  className="ml-auto cursor-pointer rounded-[5px] px-[6px] text-[16px] leading-[18px] text-light hover:bg-shade hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {rows.map((row, i) => (
          <div
            key={row.benefit}
            role="row"
            className={`flex items-center border-b border-line px-[16px] py-[12px] last:border-b-0 ${i % 2 ? 'bg-softer' : 'bg-surface'}`}
          >
            <span className="w-[230px] shrink-0 text-body font-medium text-ink">{row.benefit}</span>
            {row.cells.map((cell, j) => (
              <Cell key={employers[j]?.id ?? j} cell={cell} />
            ))}
          </div>
        ))}
      </div>
    </Panel>
  )
}
