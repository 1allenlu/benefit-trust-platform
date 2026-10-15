import { useId, type InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, ...inputProps }: TextFieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className="text-small font-medium text-mid">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`rounded-[8px] border bg-surface px-[12px] py-[9px] text-body text-ink outline-none placeholder:text-light focus:border-green ${
          error ? 'border-t-red' : 'border-line-strong'
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-small text-t-red">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-small text-light">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
