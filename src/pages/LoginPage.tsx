import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ApiError, isMockApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { nextPath } from '../auth/redirect'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { AuthLayout } from '../components/auth/AuthLayout'
import { FormError } from '../components/auth/FormError'
import { TextField } from '../components/auth/TextField'

const DEMO_EMAIL = 'maya@example.com'
const DEMO_PASSWORD = 'vested-demo'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={nextPath(params)} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      await login(email, password)
      navigate(nextPath(params), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Pick up your benefits where you left them."
      footer={
        <>
          New to Vested?{' '}
          <Link to={`/signup${params.size ? `?${params}` : ''}`} className="font-medium text-t-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {isMockApi && (
        <div className="flex flex-wrap items-center gap-[8px] rounded-[8px] bg-soft px-[12px] py-[9px]">
          <Chip label="Demo" tone="teal" />
          <span className="text-small text-mid">
            {DEMO_EMAIL} · {DEMO_PASSWORD}
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_EMAIL)
              setPassword(DEMO_PASSWORD)
            }}
            className="cursor-pointer text-small font-medium text-t-link hover:underline"
          >
            Fill in
          </button>
        </div>
      )}
      <form className="flex flex-col gap-[14px]" onSubmit={onSubmit} noValidate>
        {error && <FormError message={error} />}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button kind="primary" type="submit" disabled={submitting} className="justify-center disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
