import { useState } from 'react'
import { contentApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import type { CommunityPost, CommunityReply } from '../../data/mock'
import { Button } from '../Button'
import { Chip } from '../Chip'
import { Panel } from '../Panel'
import { useToast } from '../Toast'

type PostCardProps = {
  post: CommunityPost
  initiallyHelpful?: boolean
}

export function PostCard({ post, initiallyHelpful = false }: PostCardProps) {
  const toast = useToast()
  const { user } = useAuth()
  const [markedHelpful, setMarkedHelpful] = useState(initiallyHelpful)
  const [replies, setReplies] = useState<CommunityReply[]>(post.replies ?? [])
  const [replying, setReplying] = useState(false)
  const [draft, setDraft] = useState('')
  const helpful = post.helpful + (markedHelpful ? 1 : 0)

  const toggleHelpful = () => {
    const next = !markedHelpful
    setMarkedHelpful(next) // optimistic
    contentApi.setHelpful(post.id, next).catch(() => setMarkedHelpful(!next))
  }

  const share = () => {
    const url = `${window.location.origin}/community#${post.id}`
    navigator.clipboard?.writeText(url).then(
      () => toast('Link copied', 'info'),
      () => toast(url, 'info'),
    )
  }

  const sendReply = async () => {
    const body = draft.trim()
    if (!body) return
    const reply = await contentApi.replyToPost(post.id, body, user ? user.shortName : 'Anonymous')
    setReplies((list) => [...list, reply])
    setDraft('')
    setReplying(false)
    toast('Reply posted')
  }

  return (
    <Panel className="w-full gap-[11px]">
      <div id={post.id} className="flex items-center gap-[9px]">
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

      {replies.length > 0 && (
        <ul className="flex flex-col gap-[8px] border-l-2 border-line pl-[14px]">
          {replies.map((reply) => (
            <li key={reply.id} className="flex flex-col gap-[2px]">
              <span className="text-small font-medium text-mid">
                {reply.author} · <span className="font-normal text-light">{reply.when}</span>
              </span>
              <p className="text-body text-ink">{reply.body}</p>
            </li>
          ))}
        </ul>
      )}

      {replying && (
        <div className="flex flex-col gap-[8px]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            aria-label="Your reply"
            placeholder="Share what you know. Your name isn't attached to published facts."
            className="w-full resize-y rounded-[8px] border border-line-strong px-[12px] py-[9px] text-body text-ink outline-none placeholder:text-light focus:border-green"
          />
          <div className="flex gap-[8px]">
            <Button kind="primary" onClick={sendReply} disabled={!draft.trim()} className="disabled:opacity-50">
              Post reply
            </Button>
            <Button kind="ghost" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-[16px] border-t border-line pt-[10px] text-small font-medium text-mid">
        <button
          type="button"
          aria-pressed={markedHelpful}
          onClick={toggleHelpful}
          className={`cursor-pointer whitespace-pre hover:text-ink ${markedHelpful ? 'text-t-green' : ''}`}
        >
          {`Helpful  ·  ${helpful}`}
        </button>
        <button type="button" onClick={() => setReplying((v) => !v)} className="cursor-pointer hover:text-ink">
          Reply
        </button>
        <button type="button" onClick={share} className="cursor-pointer hover:text-ink">
          Share
        </button>
        <div className="flex-1" />
        <span className="font-normal text-light">Policy and experience are labelled separately</span>
      </div>
    </Panel>
  )
}
