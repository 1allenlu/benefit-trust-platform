import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { fieldClass } from './fieldClass'


function Field({ label, id, children, hint }: { label: string; id: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className="text-small font-medium text-mid">
        {label}
      </label>
      {children}
      {hint && <p className="text-small text-light">{hint}</p>}
    </div>
  )
}

export function SelectField({
  label,
  hint,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; options: { value: string; label: string }[] }) {
  const id = useId()
  return (
    <Field label={label} id={id} hint={hint}>
      <select id={id} className={`${fieldClass} cursor-pointer`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function TextAreaField({ label, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const id = useId()
  return (
    <Field label={label} id={id} hint={hint}>
      <textarea id={id} rows={4} className={`${fieldClass} resize-y`} {...props} />
    </Field>
  )
}

