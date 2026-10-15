import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '../api'
import { useAuth } from '../auth/AuthContext'
import { nextPath } from '../auth/redirect'
import { Button } from '../components/Button'
import { AuthLayout } from '../components/auth/AuthLayout'
import { FormError } from '../components/auth/FormError'
import { TextField } from '../components/auth/TextField'

const MIN_PASSWORD_LENGTH = 8

type Fields = { name: string; email: string; password: string }

function validate({ name, email, password }: Fields) {
  const errors: Partial<Fields> = {}
  if (!name.trim()) errors.name = 'Enter your name.'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  return errors
}

export function SignupPage() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [fields, setFields] = useState<Fields>({ name: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Fields>>({})
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={nextPath(params)} replace />

  const update = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validate(fields)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    setError(undefined)
    try {
      await signup(fields)
      navigate(nextPath(params), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track your own package and add what you know. Your name is never attached to reports."
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${params.size ? `?${params}` : ''}`} className="font-medium text-t-link hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-[14px]" onSubmit={onSubmit} noValidate>
        {error && <FormError message={error} />}
        <TextField label="Full name" autoComplete="name" value={fields.name} onChange={update('name')} error={fieldErrors.name} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={update('password')}
          error={fieldErrors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <Button kind="primary" type="submit" disabled={submitting} className="justify-center disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
