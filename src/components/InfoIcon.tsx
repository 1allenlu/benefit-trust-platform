import infoIcon from '../assets/icons/info.svg'

export function InfoIcon({ label = 'More information' }: { label?: string }) {
  return <img src={infoIcon} alt={label} width={14} height={14} className="shrink-0" />
}
