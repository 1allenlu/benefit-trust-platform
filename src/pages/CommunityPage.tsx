import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import checkIcon from '../assets/icons/check.svg'
import crossIcon from '../assets/icons/cross.svg'
import { contentApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/Button'
import { InfoIcon } from '../components/InfoIcon'
import { Loaded } from '../components/Loaded'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { Panel } from '../components/Panel'
import { SectionHeader } from '../components/SectionHeader'
import { TabItem } from '../components/TabItem'
import { useToast } from '../components/Toast'
import { AskQuestionModal } from '../components/community/AskQuestionModal'
import { PostCard } from '../components/community/PostCard'
import type { CommunityPost } from '../data/mock'
import { useApi } from '../hooks/useApi'

type CommunityData = Awaited<ReturnType<typeof contentApi.getCommunity>>

const filterMatchers: Record<string, (post: CommunityPost) => boolean> = {
  Everything: () => true,
  Questions: (post) => post.kind === 'Question',
  'Employer answers': (post) => Boolean(post.employerAnswer),
  Corrections: (post) => post.kind === 'Correction',
  'Experience reports': (post) => post.kind === 'Experience',
}

export function CommunityPage() {
  const state = useApi(() => contentApi.getCommunity(), [])
  return (
    <PageShell activeTab="community">
      <Loaded state={state}>{(data) => <CommunityContent data={data} />}</Loaded>
    </PageShell>
  )
}

function CommunityContent({ data }: { data: CommunityData }) {
  const toast = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [posts, setPosts] = useState(data.posts)
  const [following, setFollowing] = useState(data.following)
  const [filter, setFilter] = useState(data.filters[0].label)
  const [sort, setSort] = useState(data.sorts[0])
  const [managing, setManaging] = useState(false)

  // ?ask=<companyId>&topic=… opens the composer, e.g. from a profile or the 401(k) explorer.
  const askFor = params.get('ask')
  const closeAsk = () => setParams({}, { replace: true })
  const openAsk = (companyId = '') => {
    if (!user) {
      const next = encodeURIComponent(`/community?ask=${companyId}`)
      navigate(`/login?next=${next}`)
      return
    }
    setParams({ ask: companyId }, { replace: true })
  }

  const visible = useMemo(() => {
    let list = posts.filter(filterMatchers[filter] ?? (() => true))
    if (sort === 'Unanswered') list = list.filter((post) => !post.employerAnswer && !post.replies?.length)
    if (sort === 'Most helpful') list = [...list].sort((a, b) => b.helpful - a.helpful)
    return list
  }, [posts, filter, sort])

  const unfollow = async (id: string, name: string) => {
    await contentApi.setFollowing(id, false)
    setFollowing((list) => list.filter((c) => c.id !== id))
    toast(`Unfollowed ${name}`, 'info')
  }

  return (
    <>
      <PageHeader
        title="Community"
        subtitle="Questions, corrections and lived experience. Official policy and employee experience are always labelled separately."
        actions={
          <>
            <Button onClick={() => openAsk()}>Ask a question</Button>
            <Button kind="primary" to="/contribute">
              Add your benefits
            </Button>
          </>
        }
      />

      <div className="flex w-full items-start gap-[18px]">
        <aside className="flex w-[230px] shrink-0 flex-col gap-[16px]">
          <Panel className="gap-[6px]">
            <p className="text-cap font-semibold text-light uppercase">Show</p>
            {data.filters.map((item) => {
              const active = item.label === filter
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.label)}
                  className={`flex cursor-pointer items-center gap-[8px] rounded-[8px] px-[10px] py-[8px] text-left ${active ? 'bg-green-50' : 'hover:bg-soft'}`}
                >
                  <span className={`text-body whitespace-nowrap ${active ? 'font-medium text-t-green' : 'text-mid'}`}>{item.label}</span>
                  <div className="flex-1" />
                  <span className="text-small text-light">{item.count}</span>
                </button>
              )
            })}
          </Panel>

          <Panel className="gap-[8px]">
            <p className="text-cap font-semibold text-light uppercase">Companies you follow</p>
            {following.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => navigate(`/companies/${company.id}?tab=community`)}
                className="flex cursor-pointer items-center gap-[9px] rounded-[6px] py-[6px] text-left hover:bg-softer"
              >
                <span className="size-[22px] shrink-0 rounded-[6px] bg-shade" />
                <span className="text-body whitespace-nowrap text-ink">{company.name}</span>
                <div className="flex-1" />
                <span className="text-small text-light">{company.count}</span>
              </button>
            ))}
            {following.length === 0 && <p className="text-small text-light">Follow companies from their profile pages.</p>}
            <Button kind="ghost" className="w-full" onClick={() => setManaging(true)}>
              Manage
            </Button>
          </Panel>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
          <div className="flex w-full items-start gap-[4px] border-b border-line" role="tablist">
            {data.sorts.map((item) => (
              <TabItem key={item} label={item} active={item === sort} onClick={() => setSort(item)} xPadClassName="px-[12px]" yPadClassName="pb-[8px]" />
            ))}
          </div>
          {visible.map((post) => (
            <PostCard key={post.id} post={post} initiallyHelpful={data.helpfulPostIds.includes(post.id)} />
          ))}
          {visible.length === 0 && <p className="text-body text-light">Nothing here yet.</p>}
        </div>

        <aside className="flex w-[330px] shrink-0 flex-col gap-[16px]">
          <section className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-soft px-[20px] pt-[18px] pb-[20px]">
            <SectionHeader title="Add your benefits" subtitle="Three minutes, anonymous" />
            <ol className="flex flex-col gap-[12px]">
              {data.contributeSteps.map((step, i) => (
                <li key={step.title} className="flex items-start gap-[11px]">
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-green text-small font-medium text-on-dark">{i + 1}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <p className="text-body font-medium text-ink">{step.title}</p>
                    <p className="text-small text-mid">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button kind="primary" className="w-full" to="/contribute">
              Start — 3 minutes
            </Button>
          </section>

          <Panel className="gap-[10px]">
            <SectionHeader title="Top contributors" subtitle="This month" />
            {data.contributors.map((person) => (
              <div key={person.name} className="flex items-center gap-[10px] py-[7px]">
                <span className="w-[16px] shrink-0 text-small font-medium text-light">{person.rank}</span>
                <span className={`size-[26px] shrink-0 rounded-full ${person.isYou ? 'bg-green-50' : 'bg-shade'}`} />
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
                  <span className="text-body font-medium text-ink">{person.name}</span>
                  <span className="text-small text-light">{person.fields} verified fields</span>
                </div>
              </div>
            ))}
          </Panel>

          <section className="flex flex-col gap-[10px] rounded-[12px] border border-line bg-softer px-[20px] pt-[18px] pb-[20px]">
            <SectionHeader title="What employers can and cannot do" action={<InfoIcon label="Payment buys publishing tools, never placement or score." />} />
            <ul className="flex flex-col gap-[10px]">
              {data.employerRules.map((rule) => (
                <li key={rule.text} className="flex items-start gap-[9px] pt-[5px]">
                  <img src={rule.allowed ? checkIcon : crossIcon} alt={rule.allowed ? 'Can' : 'Cannot'} width={14} height={14} className="shrink-0" />
                  <p className="min-w-0 flex-1 text-small text-mid">{rule.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {askFor !== null && user && (
        <AskQuestionModal
          key={location.search}
          companies={data.companies}
          initialCompanyId={askFor || undefined}
          initialTitle={params.get('topic') ?? ''}
          onClose={closeAsk}
          onPosted={(post) => {
            setPosts((list) => [post, ...list])
            setFilter('Everything')
            setSort('Newest')
            closeAsk()
            toast(`Posted to ${post.company} — it's at the top of the feed`)
          }}
        />
      )}

      {managing && (
        <Modal title="Companies you follow" subtitle="You'll hear when their profile or answers change" onClose={() => setManaging(false)} width={420}>
          {following.length ? (
            <ul className="flex flex-col">
              {following.map((company) => (
                <li key={company.id} className="flex items-center gap-[10px] border-b border-line py-[10px] last:border-b-0">
                  <span className="size-[22px] shrink-0 rounded-[6px] bg-shade" />
                  <span className="flex-1 text-body text-ink">{company.name}</span>
                  <Button onClick={() => unfollow(company.id, company.name)}>Unfollow</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-mid">You're not following anyone yet. Use Follow on any company profile.</p>
          )}
        </Modal>
      )}
    </>
  )
}
