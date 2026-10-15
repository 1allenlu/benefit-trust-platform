import { useState } from 'react'
import checkIcon from '../../assets/icons/check-verified.svg'
import { contentApi } from '../../api'
import { Button } from '../Button'
import { useToast } from '../Toast'

type CompanyHeaderProps = {
  companyId: string
  name: string
  verified: boolean
  meta: string[]
  initiallyFollowing: boolean
  /** Where "Compare with my offer" goes. */
  compareTo: string
}

export function CompanyHeader({ companyId, name, verified, meta, initiallyFollowing, compareTo }: CompanyHeaderProps) {
  const toast = useToast()
  const [following, setFollowing] = useState(initiallyFollowing)

  const toggleFollow = () => {
    const next = !following
    setFollowing(next) // optimistic
    contentApi.setFollowing(companyId, next).then(
      () => toast(next ? `Following ${name} — you'll hear about changes` : `Unfollowed ${name}`, 'info'),
      () => setFollowing(!next),
    )
  }

  return (
    <div className="flex w-full items-center gap-[16px]">
      <span className="size-[56px] shrink-0 rounded-[12px] bg-shade" />
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex items-center gap-[9px]">
          <h1 className="text-h1 font-bold whitespace-nowrap text-ink">{name}</h1>
          {verified && (
            <span className="flex shrink-0 items-center gap-[5px] rounded-full border border-green bg-green-50 py-[4px] pr-[10px] pl-[8px] text-small font-medium text-t-green">
              <img src={checkIcon} alt="" width={12} height={12} />
              Employer verified
            </span>
          )}
        </div>
        <p className="flex items-center gap-[10px] text-small whitespace-nowrap text-light">
          {meta.map((item, i) => (
            <span key={item} className="flex items-center gap-[10px]">
              {i > 0 && <span>·</span>}
              {item}
            </span>
          ))}
        </p>
      </div>
      <Button to={`/contribute?company=${companyId}`}>Suggest an edit</Button>
      <Button onClick={toggleFollow} aria-pressed={following}>
        {following ? 'Following' : 'Follow'}
      </Button>
      <Button kind="primary" to={compareTo}>
        Compare with my offer
      </Button>
    </div>
  )
}
