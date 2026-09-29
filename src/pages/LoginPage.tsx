import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '../components/Button'
import { useAuth } from '../auth/AuthContext'

type LoginLocationState = { from?: { pathname?: string } }

export function LoginPage() {
  const { signIn, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const destination = (location.state as LoginLocationState | null)?.from?.pathname ?? '/admin'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    setLocalError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(destination, { replace: true })
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : 'Inloggningen misslyckades. Försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>Logga in</h1>
        <p>Logga in med ditt konto för att fortsätta till administrationen.</p>
      </div>
      <form className="test-lesson-form login-form" onSubmit={handleSubmit}>
        <div className="request-form-grid">
          <div className="request-field request-field-full">
            <label htmlFor="login-email">E-postadress</label>
            <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="request-field request-field-full">
            <label htmlFor="login-password">Lösenord</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
        </div>
        {localError && <p className="request-status request-status-error" role="alert">{localError}</p>}
        <Button className="request-submit" type="submit" disabled={submitting}>{submitting ? 'Loggar in…' : 'Logga in'}</Button>
      </form>
    </section>
  )
}

export function NoPermissionPage() {
  return <section className="information-page information-page-text-only"><div className="information-page-copy"><h1>Ingen behörighet</h1><p>Ditt konto har inte behörighet att öppna administrationssidorna.</p><Button to="/">Till startsidan</Button></div></section>
}
