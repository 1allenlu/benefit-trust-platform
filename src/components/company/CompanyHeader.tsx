import { useState } from 'react'
import checkIcon from '../../assets/icons/check-verified.svg'
import { Button } from '../Button'

type CompanyHeaderProps = {
  name: string
  verified: boolean
  meta: string[]
}

export function CompanyHeader({ name, verified, meta }: CompanyHeaderProps) {
  const [following, setFollowing] = useState(false)

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
      <Button>Suggest an edit</Button>
      <Button onClick={() => setFollowing((f) => !f)} aria-pressed={following}>
        {following ? 'Following' : 'Follow'}
      </Button>
      <Button kind="primary" to="/compare">
        Compare with my offer
      </Button>
    </div>
  )
}
