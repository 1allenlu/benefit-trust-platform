import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { contentApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { SelectField } from '../components/FormControls'
import { fieldClass } from '../components/fieldClass'
import { Loaded } from '../components/Loaded'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { useToast } from '../components/Toast'
import { useApi } from '../hooks/useApi'

const FIELDS = [
  { key: 'match', label: '401(k) employer match', suffix: '% of pay', placeholder: '4' },
  { key: 'pto', label: 'Paid time off', suffix: 'days / yr', placeholder: '20' },
  { key: 'parental', label: 'Paid parental leave', suffix: 'weeks', placeholder: '12' },
  { key: 'health', label: 'Health premium the employer pays', suffix: '%', placeholder: '80' },
  { key: 'hsa', label: 'HSA employer seed', suffix: '$ / yr', placeholder: '750' },
  { key: 'learning', label: 'Learning budget', suffix: '$ / yr', placeholder: '2000' },
] as const

const STEPS = ['Employer and plan year', 'What you know', 'Review and submit']

type CompanyOption = { id: string; name: string }

export function ContributePage() {
  const companies = useApi(() => contentApi.listCompanies(), [])
  return (
    <PageShell activeTab="community">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-[18px]">
        <Loaded state={companies}>{(list) => <ContributeFlow companies={list} />}</Loaded>
      </div>
    </PageShell>
  )
}

function ContributeFlow({ companies }: { companies: CompanyOption[] }) {
  const toast = useToast()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [companyId, setCompanyId] = useState(params.get('company') ?? companies[0]?.id ?? '')
  const [planYear, setPlanYear] = useState('2026')
  const [values, setValues] = useState<Record<string, string>>({})
  const [documentName, setDocumentName] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ fieldsSubmitted: number; contributedFields: number }>()

  const company = companies.find((c) => c.id === companyId)
  const filled = FIELDS.filter((f) => values[f.key]?.trim())
  const canContinue = step !== 1 || filled.length > 0 || Boolean(documentName)

  const submit = async () => {
    setSubmitting(true)
    const res = await contentApi.submitContribution({ companyId, planYear, fields: values, documentName })
    setResult(res)
    toast('Thanks — sent for verification')
  }

  if (result) {
    return (
      <Panel className="items-start gap-[14px]">
        <Chip label="Submitted" tone="verified" />
        <h1 className="text-h1 font-bold text-ink">Thank you — that helps the next person.</h1>
        <p className="text-body text-mid">
          {result.fieldsSubmitted} {result.fieldsSubmitted === 1 ? 'field' : 'fields'} for {company?.name} are queued for checking.
          {documentName ? ' Your document backs them, so they outrank typed reports once verified.' : ' Add a document later and they outrank typed reports.'}{' '}
          Your name is never attached.
        </p>
        <p className="rounded-[8px] bg-green-50 px-[12px] py-[9px] text-small font-medium text-t-green">
          You've now contributed {result.contributedFields} fields — see yourself on the Top contributors list.
        </p>
        <div className="flex gap-[8px]">
          <Button kind="primary" to={`/companies/${companyId}`}>
            View {company?.name}
          </Button>
          <Button to="/community">Back to community</Button>
        </div>
      </Panel>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-[3px]">
        <Link to="/community" className="text-small text-light hover:text-mid">
          ← Community
        </Link>
        <h1 className="text-h1 font-bold text-ink">Add your benefits</h1>
        <p className="text-body text-mid">Three minutes, anonymous. We prefill anything already published and check everything before it goes live.</p>
      </div>

      <ol className="flex gap-[8px]">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-[6px]">
            <span className={`h-[4px] rounded-full ${i <= step ? 'bg-green' : 'bg-shade'}`} />
            <span className={`text-small ${i === step ? 'font-medium text-ink' : 'text-light'}`}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <Panel className="gap-[16px]">
        {step === 0 && (
          <>
            <SectionHeader title="Which employer?" subtitle="Pick the company and plan year your benefits are from" />
            <SelectField label="Employer" value={companyId} onChange={(e) => setCompanyId(e.target.value)} options={companies.map((c) => ({ value: c.id, label: c.name }))} />
            <SelectField
              label="Plan year"
              value={planYear}
              onChange={(e) => setPlanYear(e.target.value)}
              options={[
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
              ]}
            />
          </>
        )}

        {step === 1 && (
          <>
            <SectionHeader title="What you know" subtitle="Fill in anything you're sure of. Leave the rest blank — blank stays unknown, never zero." />
            <div className="grid grid-cols-2 gap-[14px]">
              {FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-[5px]">
                  <span className="text-small font-medium text-mid">{field.label}</span>
                  <span className="relative flex items-center">
                    <input
                      inputMode="decimal"
                      value={values[field.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value.replace(/[^\d.]/g, '') }))}
                      placeholder={field.placeholder}
                      className={`${fieldClass} pr-[80px]`}
                    />
                    <span className="pointer-events-none absolute right-[12px] text-small text-light">{field.suffix}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-[12px] rounded-[8px] border-2 border-dashed border-line-strong px-[14px] py-[14px] hover:bg-softer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="sr-only"
                onChange={(e) => setDocumentName(e.target.files?.[0]?.name)}
              />
              <span className="flex flex-col">
                <span className="text-body font-medium text-ink">{documentName ?? 'Upload an offer letter or benefits summary'}</span>
                <span className="text-small text-light">
                  {documentName ? 'Attached — document-backed fields outrank typed ones' : 'Optional. PDF or image. Personal details are removed before review.'}
                </span>
              </span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <SectionHeader title="Review" subtitle={`${company?.name} · plan year ${planYear}`} />
            <dl className="flex flex-col">
              {filled.map((field) => (
                <div key={field.key} className="flex items-center gap-[12px] border-b border-line py-[10px]">
                  <dt className="flex-1 text-body text-mid">{field.label}</dt>
                  <dd className="text-body font-medium text-ink">
                    {values[field.key]} {field.suffix}
                  </dd>
                </div>
              ))}
              {documentName && (
                <div className="flex items-center gap-[12px] border-b border-line py-[10px]">
                  <dt className="flex-1 text-body text-mid">Document</dt>
                  <dd className="text-body font-medium text-ink">{documentName}</dd>
                </div>
              )}
            </dl>
            <p className="rounded-[8px] bg-soft px-[12px] py-[9px] text-small text-mid">
              We check every field before it publishes. Document-backed fields outrank typed ones, and your name is never attached.
            </p>
          </>
        )}

        <div className="flex items-center gap-[8px]">
          {step > 0 && (
            <Button kind="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {!canContinue && <span className="text-small text-light">Add at least one field or a document</span>}
          {step < 2 ? (
            <Button kind="primary" onClick={() => setStep((s) => s + 1)} disabled={!canContinue} className="disabled:opacity-50">
              Continue
            </Button>
          ) : (
            <Button kind="primary" onClick={submit} disabled={submitting} className="disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit for verification'}
            </Button>
          )}
        </div>
      </Panel>
    </>
  )
}
