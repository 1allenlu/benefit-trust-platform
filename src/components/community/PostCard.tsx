import { useState } from 'react'
import type { CommunityPost } from '../../data/mock'
import { Chip } from '../Chip'
import { Panel } from '../Panel'

export function PostCard({ post }: { post: CommunityPost }) {
  const [markedHelpful, setMarkedHelpful] = useState(false)
  const helpful = post.helpful + (markedHelpful ? 1 : 0)

  return (
    <Panel className="w-full gap-[11px]">
      <div className="flex items-center gap-[9px]">
        <span className="size-[24px] shrink-0 rounded-[6px] bg-shade" />
        <span className="text-body font-medium whitespace-nowrap text-ink">{post.company}</span>
        <Chip label={post.kind} tone={post.tone} />
        <div className="flex-1" />
        <span className="text-small whitespace-nowrap text-light">{post.meta}</span>
      </div>
      <h2 className="text-h2 font-semibold text-ink">{post.title}</h2>
      <p className="text-body text-mid">{post.body}</p>

      {post.employerAnswer && (
        <div className="flex flex-col gap-[7px] rounded-[8px] border border-green bg-green-50 px-[15px] py-[13px]">
          <div className="flex items-center gap-[8px] whitespace-nowrap">
            <Chip label="Employer answer" tone="verified" />
            <span className="text-small font-medium text-t-green">{post.employerAnswer.author}</span>
            <div className="flex-1" />
            <span className="text-small text-mid">{post.employerAnswer.when}</span>
          </div>
          <p className="text-body text-ink">{post.employerAnswer.body}</p>
        </div>
      )}

      <div className="flex items-center gap-[16px] border-t border-line pt-[10px] text-small font-medium text-mid">
        <button
          type="button"
          aria-pressed={markedHelpful}
          onClick={() => setMarkedHelpful((v) => !v)}
          className={`cursor-pointer whitespace-pre hover:text-ink ${markedHelpful ? 'text-t-green' : ''}`}
        >
          {`Helpful  ·  ${helpful}`}
        </button>
        <button type="button" className="cursor-pointer hover:text-ink">
          Reply
        </button>
        <button type="button" className="cursor-pointer hover:text-ink">
          Share
        </button>
        <div className="flex-1" />
        <span className="font-normal text-light">Policy and experience are labelled separately</span>
      </div>
    </Panel>
  )
}
