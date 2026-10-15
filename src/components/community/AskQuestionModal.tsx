import { useState, type FormEvent } from 'react'
import { contentApi } from '../../api'
import type { CommunityPost } from '../../data/mock'
import { Button } from '../Button'
import { SelectField, TextAreaField } from '../FormControls'
import { fieldClass } from '../fieldClass'
import { Modal } from '../Modal'

type AskQuestionModalProps = {
  companies: { id: string; name: string }[]
  initialCompanyId?: string
  initialTitle?: string
  onClose: () => void
  onPosted: (post: CommunityPost) => void
}

const kinds = [
  { value: 'Question', label: 'Question — ask people who know' },
  { value: 'Correction', label: 'Correction — something on a profile is wrong' },
  { value: 'Experience', label: 'Experience — how it actually worked for you' },
]

export function AskQuestionModal({ companies, initialCompanyId, initialTitle = '', onClose, onPosted }: AskQuestionModalProps) {
  const [companyId, setCompanyId] = useState(initialCompanyId ?? companies[0]?.id ?? '')
  const [kind, setKind] = useState<'Question' | 'Correction' | 'Experience'>('Question')
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    const post = await contentApi.createPost({ companyId, kind, title: title.trim(), body: body.trim() })
    onPosted(post as CommunityPost)
  }

  return (
    <Modal title="Post to the community" subtitle="It lives on the company's page, so the next person finds the answer" onClose={onClose} width={520}>
      <form className="flex flex-col gap-[14px]" onSubmit={onSubmit}>
        <SelectField label="Company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} options={companies.map((c) => ({ value: c.id, label: c.name }))} />
        <SelectField label="Type" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} options={kinds} />
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="ask-title" className="text-small font-medium text-mid">
            Title
          </label>
          <input
            id="ask-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Does the match vest immediately?"
            className={fieldClass}
            required
          />
        </div>
        <TextAreaField label="Details (optional)" value={body} onChange={(e) => setBody(e.target.value)} hint="Your name is never attached to published facts." />
        <div className="flex gap-[8px]">
          <Button kind="primary" type="submit" disabled={submitting || !title.trim()} className="disabled:opacity-50">
            {submitting ? 'Posting…' : 'Post'}
          </Button>
          <Button kind="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
