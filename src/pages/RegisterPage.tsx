import { Link, useNavigate } from 'react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { useAuth } from '../auth/AuthContext'

export function RegisterPage() {
  const { signUp, clearError } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    setLocalError(null)
    setSubmitting(true)

    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      })

      navigate('/elev', { replace: true })
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : 'Registreringen misslyckades. Försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>Skapa konto</h1>
        <p>Registrera dig som student och få tillgång till våra kurser och bokningar.</p>
      </div>

      <form className="test-lesson-form login-form" onSubmit={handleSubmit}>
        <div className="request-form-grid">
          <div className="request-field">
            <label htmlFor="register-first-name">Förnamn</label>
            <input id="register-first-name" type="text" required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </div>
          <div className="request-field">
            <label htmlFor="register-last-name">Efternamn</label>
            <input id="register-last-name" type="text" required value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </div>
          <div className="request-field">
            <label htmlFor="register-phone">Telefonnummer</label>
            <input id="register-phone" type="tel" required value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          </div>
          <div className="request-field">
            <label htmlFor="register-email">E-postadress</label>
            <input id="register-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="request-field">
            <label htmlFor="register-password">Lösenord</label>
            <input id="register-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="request-field">
            <label htmlFor="register-confirm-password">Bekräfta lösenord</label>
            <input id="register-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
        </div>

        {localError && <p className="request-status request-status-error" role="alert">{localError}</p>}

        <Button className="request-submit" type="submit" disabled={submitting}>
          {submitting ? 'Skapar konto…' : 'Registrera mig'}
        </Button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Har du redan ett konto? <Link to="/login">Logga in</Link>
        </p>
      </form>
    </section>
  )
}
