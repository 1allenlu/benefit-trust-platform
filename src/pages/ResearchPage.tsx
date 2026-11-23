import { useState, type ReactNode } from 'react'
import { contentApi } from '../api'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { clearEvents, eventsCsv, readEvents, summarize } from '../lib/research'

const yesNo = (v: boolean) => <Chip label={v ? 'Yes' : 'No'} tone={v ? 'verified' : 'muted'} />

/** Facilitator view for the two proposed tests. Not linked from the nav. */
export function ResearchPage() {
  const [events] = useState(readEvents)
  const { offerDecision, returnUse } = summarize(events)

  const download = () => {
    const url = URL.createObjectURL(new Blob([eventsCsv(events)], { type: 'text/csv' }))
    Object.assign(document.createElement('a'), { href: url, download: `vested-session-${new Date().toISOString().slice(0, 10)}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  const newSession = async () => {
    if (events.length && !window.confirm('Clear this session log and reset the demo? Download the CSV first if you need it.')) return
    clearEvents()
    await contentApi.resetDemo()
    window.location.assign('/research')
  }

  const rows: [string, ReactNode][][] = [
    [
      ['First category opened', offerDecision.firstCategory ?? '—'],
      ['Found the enrollment deadline before accepting', yesNo(offerDecision.foundDeadline)],
      ['Opened a supporting clause before accepting', yesNo(offerDecision.openedSupport)],
      ['Saved a question for HR', yesNo(offerDecision.savedHrQuestion)],
      ['Accepted the offer', yesNo(offerDecision.accepted)],
    ],
    [
      ['Days active', String(returnUse.daysActive)],
      ['Returned to My benefits on a later day', yesNo(returnUse.returnedLaterDay)],
      ['Completed or updated a task on a later day', yesNo(returnUse.actedLaterDay)],
    ],
  ]

  return (
    <PageShell activeTab="">
      <div className="flex w-full items-center gap-[12px]">
        <SectionHeader
          title="Research session"
          subtitle="Anonymous events from this browser only. Whether a return was unprompted is for the facilitator to note."
        />
        <Button onClick={download} disabled={!events.length}>
          Download CSV
        </Button>
        <Button kind="primary" onClick={newSession}>
          Start new session
        </Button>
      </div>

      <div className="flex w-full items-start gap-[18px]">
        {(['Offer decision test', 'Return-use test'] as const).map((title, i) => (
          <Panel key={title} className="min-w-0 flex-1 gap-[10px]">
            <SectionHeader title={title} />
            <dl className="flex flex-col">
              {rows[i].map(([label, value]) => (
                <div key={label} className="flex items-center gap-[12px] border-b border-line py-[9px] last:border-b-0">
                  <dt className="flex-1 text-body text-mid">{label}</dt>
                  <dd className="text-body font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>

      <Panel className="w-full gap-[10px]">
        <SectionHeader title="Event log" subtitle={`${events.length} events`} />
        {events.length ? (
          <ol className="flex flex-col">
            {events.map((e, i) => (
              <li key={i} className="flex gap-[16px] border-b border-line py-[7px] text-small last:border-b-0">
                <span className="w-[170px] shrink-0 text-light">{new Date(e.at).toLocaleString()}</span>
                <span className="w-[180px] shrink-0 font-medium text-ink">{e.name}</span>
                <span className="text-mid">{e.detail}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-small text-light">Nothing yet. Open the sample offer to start.</p>
        )}
      </Panel>
    </PageShell>
  )
}
