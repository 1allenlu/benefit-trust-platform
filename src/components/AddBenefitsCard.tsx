import { Link } from 'react-router'
import plusIcon from '../assets/icons/plus.svg'

export function AddBenefitsCard() {
  return (
    <Link
      to="/contribute"
      className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[12px] border border-dashed border-line-strong px-[16px] py-[15px] hover:bg-soft"
    >
      <img src={plusIcon} alt="" width={20} height={20} />
      <span className="text-body font-medium whitespace-nowrap text-t-green">Add your benefits</span>
      <span className="text-center text-small whitespace-nowrap text-light">3 minutes. Anonymous.</span>
    </Link>
  )
}
