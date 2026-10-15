import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router'

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'dark'

const kindClasses: Record<ButtonKind, string> = {
  primary: 'bg-green text-on-dark hover:bg-t-green',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-soft',
  ghost: 'text-t-green hover:bg-green-50',
  dark: 'bg-teal-900 text-on-dark hover:bg-teal-700',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: ButtonKind
  /** Renders a router link instead of a button. */
  to?: string
}

export function Button({ kind = 'secondary', className = '', to, ...props }: ButtonProps) {
  const classes = `inline-flex cursor-pointer items-center rounded-[8px] px-[16px] py-[9px] text-body font-medium whitespace-nowrap ${kindClasses[kind]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {props.children}
      </Link>
    )
  }
  return <button type="button" className={classes} {...props} />
}
