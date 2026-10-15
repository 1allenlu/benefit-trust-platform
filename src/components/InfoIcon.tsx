import infoIcon from '../assets/icons/info.svg'

/** Info glyph; hovering shows `label` as a tooltip. */
export function InfoIcon({ label = 'More information' }: { label?: string }) {
  return (
    <span title={label} className="shrink-0 cursor-help">
      <img src={infoIcon} alt={label} width={14} height={14} />
    </span>
  )
}
