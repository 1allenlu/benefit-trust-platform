import chevronIcon from '../../assets/icons/select-chevron.svg'

type ScopeSelectProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function ScopeSelect({ label, value, options, onChange }: ScopeSelectProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <span className="text-cap font-semibold whitespace-nowrap text-light uppercase">{label}</span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-[8px] border border-line-strong bg-surface py-[9px] pr-[30px] pl-[12px] text-body text-ink outline-none"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <img src={chevronIcon} alt="" width={11} height={11} className="pointer-events-none absolute right-[11px]" />
      </span>
    </label>
  )
}
