import { Link } from 'react-router'
import type { CommunityItem } from '../data/mock'
import { Button } from './Button'
import { Chip } from './Chip'
import { Panel } from './Panel'
import { SectionHeader } from './SectionHeader'

type CommunityFeedProps = {
  items: CommunityItem[]
}

export function CommunityFeed({ items }: CommunityFeedProps) {
  return (
    <Panel className="w-[430px] shrink-0 gap-[12px] self-stretch">
      <SectionHeader title="From the community" subtitle="Last 24 hours" />
      <ul className="flex flex-col gap-[12px]">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col items-start gap-[6px] border-b border-line py-[12px]">
            <Chip label={item.tag} tone={item.tone} />
            <Link to="/community" className="text-body font-medium text-ink hover:underline">
              {item.title}
            </Link>
            <p className="text-small text-light">{item.meta}</p>
          </li>
        ))}
      </ul>
      <Button to="/community" className="w-full">
        Open community
      </Button>
    </Panel>
  )
}
