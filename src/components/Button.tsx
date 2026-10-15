import type { ButtonHTMLAttributes } from 'react'

type ButtonKind = 'primary' | 'secondary'

const kindClasses: Record<ButtonKind, string> = {
  primary: 'bg-green text-on-dark hover:bg-t-green',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-soft',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: ButtonKind
}

export function Button({ kind = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center justify-center rounded-[8px] px-[16px] py-[9px] text-body font-medium whitespace-nowrap ${kindClasses[kind]} ${className}`}
      {...props}
    />
  )
}
