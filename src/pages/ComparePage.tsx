import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { contentApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { PageStatus } from '../components/PageStatus'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { useToast } from '../components/Toast'
import { BenefitMatrix } from '../components/compare/BenefitMatrix'
import { ScopeSelect } from '../components/compare/ScopeSelect'
import { ValueStack } from '../components/compare/ValueStack'
import { compareConfig, type CompareScope } from '../data/mock'
import { useApi } from '../hooks/useApi'
import { usd } from '../lib/benefits'

/** Fit bar length per score point (81 → 162px). */
const FIT_PX_PER_POINT = 2

const asOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }))

/** Companies and scope live in the URL, so a comparison can be shared or bookmarked. */
function useCompareState() {
  const [params, setParams] = useSearchParams()
  const { defaultScope, defaultCompanyIds } = compareConfig
  const ids = params.get('ids')?.split(',').filter(Boolean) ?? defaultCompanyIds
  const scope: CompareScope = {
    location: params.get('location') ?? defaultScope.location,
    employment: (params.get('employment') as CompareScope['employment']) ?? defaultScope.employment,
    planYear: params.get('year') ?? defaultScope.planYear,
    baseSalary: Number(params.get('salary')) || defaultScope.baseSalary,
  }
  const update = (next: { ids?: string[]; scope?: Partial<CompareScope> }) => {
    const nextIds = next.ids ?? ids
    const s = { ...scope, ...next.scope }
    setParams(
      {
        ids: nextIds.join(','),
        location: s.location,
        employment: s.employment,
        year: s.planYear,
        salary: String(s.baseSalary),
      },
      { replace: true },
    )
  }
  return { ids, scope, update }
}

export function ComparePage() {
  const toast = useToast()
  const { ids, scope, update } = useCompareState()
  const state = useApi(() => contentApi.getCompare(ids, scope), [ids.join(','), scope.baseSalary, scope.employment])
  const [picking, setPicking] = useState(false)
  const [savedKey, setSavedKey] = useState<string>()
  const currentKey = JSON.stringify([ids, scope])
  const data = state.data
  const { scopeOptions, maxCompanies } = compareConfig

  const save = async () => {
    await contentApi.saveComparison(ids, scope)
    setSavedKey(currentKey)
    toast('Comparison saved — the link opens it with the same scope')
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
  }

  return (
    <PageShell activeTab="compare">
      <PageHeader
        title="Compare benefits"
        subtitle={`${ids.length} employers, same scope. Change the scope and every column changes with it.`}
        actions={
          <>
            <Button onClick={save} disabled={savedKey === currentKey}>
              {savedKey === currentKey ? 'Saved ✓' : 'Save comparison'}
            </Button>
            <Button kind="primary" onClick={() => setPicking(true)} disabled={ids.length >= maxCompanies} className="disabled:opacity-50">
              Add a company
            </Button>
          </>
        }
      />

      <section className="flex w-full items-end gap-[14px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
        <ScopeSelect
          label="Location"
          value={scope.location}
          options={asOptions(scopeOptions.location)}
          onChange={(location) => update({ scope: { location } })}
        />
        <ScopeSelect
          label="Employment type"
          value={scope.employment}
          options={asOptions(scopeOptions.employment)}
          onChange={(employment) => update({ scope: { employment: employment as CompareScope['employment'] } })}
        />
        <ScopeSelect label="Plan year" value={scope.planYear} options={asOptions(scopeOptions.planYear)} onChange={(planYear) => update({ scope: { planYear } })} />
        <ScopeSelect
          label="Base salary for % figures"
          value={String(scope.baseSalary)}
          options={scopeOptions.baseSalary.map((v) => ({ value: String(v), label: usd.format(v) }))}
          onChange={(salary) => update({ scope: { baseSalary: Number(salary) } })}
        />
        <div className="pb-[8px]">
          <Chip label="Like-for-like" tone="verified" />
        </div>
      </section>

      {!data ? (
        <PageStatus loading={state.loading} error={state.error} onRetry={state.retry} />
      ) : ids.length === 0 ? (
        <Panel className="items-start gap-[10px]">
          <SectionHeader title="Nothing to compare yet" subtitle="Add two or more companies to put their benefits side by side." />
          <Button kind="primary" onClick={() => setPicking(true)}>
            Add a company
          </Button>
        </Panel>
      ) : (
        <div className={`flex w-full flex-col gap-[18px] transition-opacity ${state.loading ? 'opacity-60' : ''}`}>
          {scope.employment === 'Part-time' && (
            <p className="rounded-[8px] bg-teal-100 px-[14px] py-[10px] text-small font-medium text-t-teal">
              Part-time scope: time off, learning and everyday budgets are prorated at 50%. Health and 401(k) rules are unchanged.
            </p>
          )}
          <ValueStack legend={compareConfig.stackLegend} employers={data.columns} />
          <BenefitMatrix employers={data.columns} rows={data.matrix} onRemove={(id) => update({ ids: ids.filter((i) => i !== id) })} />

          <div className="flex w-full items-start gap-[18px]">
            <Panel className="min-w-0 flex-1 gap-[14px] self-stretch">
              <SectionHeader title="Fit against your priorities" subtitle={compareConfig.priorities} action={<Chip label="Private to you" tone="teal" />} />
              {data.fit.map((row) => (
                <div key={row.name} className="flex items-center gap-[12px] py-[10px]">
                  <div className="flex w-[190px] shrink-0 flex-col gap-px whitespace-nowrap">
                    <span className="text-body font-medium text-ink">{row.name}</span>
                    <span className="truncate text-small text-light">{row.note}</span>
                  </div>
                  <div className="h-[10px] min-w-0 flex-1 overflow-hidden rounded-full bg-shade">
                    <div className={`h-full rounded-full ${row.isYours ? 'bg-green' : 'bg-teal-500'}`} style={{ width: row.score * FIT_PX_PER_POINT }} />
                  </div>
                  <span className="text-num-m font-semibold text-ink">{row.score}</span>
                </div>
              ))}
              <p className="text-small text-light">
                Fit is computed from the priorities you saved, on your device. Neither employer sees it, and it is not comparable between people.
              </p>
            </Panel>

            <Panel className="w-[400px] shrink-0 gap-[12px] self-stretch">
              <SectionHeader title="What we still don't know" subtitle="Shown as unknown, never scored as zero" />
              {data.unknowns.length ? (
                <ul className="flex flex-col gap-[12px]">
                  {data.unknowns.map((item) => (
                    <li key={item.field + item.detail} className="flex flex-col gap-[4px] border-b border-line py-[10px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="text-body font-medium text-ink">{item.field}</span>
                        <div className="flex-1" />
                        <Chip label="Unknown" tone="muted" />
                      </div>
                      <p className="text-small text-light">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body text-mid">Every compared field is documented.</p>
              )}
              {data.unknowns.length > 0 && (
                <Button
                  className="w-full"
                  onClick={() => {
                    const companies = new Set(data.unknowns.map((u) => u.detail.split(' · ')[0])).size
                    toast(`Asked ${companies} ${companies === 1 ? 'employer' : 'employers'} — answers will appear on their profiles`)
                  }}
                >
                  Ask these employers
                </Button>
              )}
            </Panel>
          </div>
        </div>
      )}

      {picking && data && (
        <Modal title="Add a company" subtitle={`Compare up to ${maxCompanies} at once`} onClose={() => setPicking(false)} width={420}>
          <ul className="flex flex-col">
            {data.available.map((company) => (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => {
                    update({ ids: [...ids, company.id] })
                    setPicking(false)
                    toast(`Added ${company.name}`, 'info')
                  }}
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left hover:bg-soft"
                >
                  <span className="size-[22px] shrink-0 rounded-[6px] bg-shade" />
                  <span className="text-body font-medium text-ink">{company.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </PageShell>
  )
}
