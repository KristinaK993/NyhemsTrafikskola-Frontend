import { Link, useNavigate } from 'react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { useAuth } from '../auth/AuthContext'
import { ApiRequestError } from '../api/client'

type RegisterField = 'firstName' | 'lastName' | 'phoneNumber' | 'email' | 'password' | 'confirmPassword'
type RegisterValues = Record<RegisterField, string>
type RegisterErrors = Partial<Record<RegisterField, string>>

const fieldOrder: RegisterField[] = ['firstName', 'lastName', 'phoneNumber', 'email', 'password', 'confirmPassword']
const inputIds: Record<RegisterField, string> = {
  firstName: 'register-first-name',
  lastName: 'register-last-name',
  phoneNumber: 'register-phone',
  email: 'register-email',
  password: 'register-password',
  confirmPassword: 'register-confirm-password',
}
const emptyValues: RegisterValues = { firstName: '', lastName: '', phoneNumber: '', email: '', password: '', confirmPassword: '' }

// Mirrors the backend rules so most mistakes are caught before submitting; the API still validates everything.
const passwordRule = 'Minst 8 tecken med stor bokstav, liten bokstav och en siffra.'

// Same rule as SwedishPhoneNumber in the backend: Swedish numbers, written with 0 or +46/0046, at most 10 digits nationally.
function isValidSwedishPhoneNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 50) return false

  const hasPlusPrefix = trimmed.startsWith('+')
  const body = hasPlusPrefix ? trimmed.slice(1) : trimmed
  if (!/^[0-9 ()-]+$/.test(body)) return false

  const digits = body.replace(/\D/g, '')
  let national = digits
  if (hasPlusPrefix || digits.startsWith('0046')) {
    const countryPrefix = hasPlusPrefix ? '46' : '0046'
    if (!digits.startsWith(countryPrefix)) return false
    let subscriber = digits.slice(countryPrefix.length)
    if (subscriber.startsWith('0')) subscriber = subscriber.slice(1)
    if (!subscriber) return false
    national = `0${subscriber}`
  }

  return national.length >= 7 && national.length <= 10 && national[0] === '0' && national[1] !== '0'
}

function validateField(field: RegisterField, values: RegisterValues): string | undefined {
  const value = values[field]
  switch (field) {
    case 'firstName':
      if (!value.trim()) return 'Fyll i ditt förnamn.'
      if (value.trim().length > 100) return 'Förnamnet får vara högst 100 tecken.'
      return undefined
    case 'lastName':
      if (!value.trim()) return 'Fyll i ditt efternamn.'
      if (value.trim().length > 100) return 'Efternamnet får vara högst 100 tecken.'
      return undefined
    case 'phoneNumber':
      if (!value.trim()) return 'Fyll i ditt telefonnummer.'
      if (!isValidSwedishPhoneNumber(value)) return 'Ange ett giltigt svenskt telefonnummer med högst 10 siffror, till exempel 070-123 45 67.'
      return undefined
    case 'email':
      if (!value.trim()) return 'Fyll i din e-postadress.'
      if (value.trim().length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Ange en giltig e-postadress.'
      return undefined
    case 'password':
      if (!value) return 'Fyll i ett lösenord.'
      if (value.length < 8 || !/[A-ZÅÄÖ]/.test(value) || !/[a-zåäö]/.test(value) || !/\d/.test(value)) return `Lösenordet uppfyller inte kraven. ${passwordRule}`
      return undefined
    case 'confirmPassword':
      if (!value) return 'Bekräfta ditt lösenord.'
      if (value !== values.password) return 'Lösenorden matchar inte.'
      return undefined
  }
}

function isRegisterField(value: string | undefined): value is RegisterField {
  return fieldOrder.includes(value as RegisterField)
}

export function RegisterPage() {
  const { signUp, clearError } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterValues>(emptyValues)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  function focusField(field: RegisterField) {
    document.getElementById(inputIds[field])?.focus()
  }

  function updateValue(field: RegisterField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    // Clear the message as soon as the user starts correcting the field.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    clearError()
    setGeneralError(null)

    const nextErrors: RegisterErrors = {}
    for (const field of fieldOrder) nextErrors[field] = validateField(field, values)
    setErrors(nextErrors)

    const firstInvalid = fieldOrder.find((field) => nextErrors[field])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)

    try {
      await signUp({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      })

      navigate('/elev', { replace: true })
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && isRegisterField(requestError.field)) {
        const field = requestError.field
        setErrors({ [field]: requestError.message })
        focusField(field)
      } else {
        setGeneralError(requestError instanceof Error ? requestError.message : 'Registreringen misslyckades. Försök igen.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function fieldProps(field: RegisterField) {
    const errorId = `${inputIds[field]}-error`
    const describedBy = [field === 'password' ? 'register-password-rule' : null, errors[field] ? errorId : null].filter(Boolean).join(' ')
    return {
      id: inputIds[field],
      value: values[field],
      onChange: (event: { target: { value: string } }) => updateValue(field, event.target.value),
      'aria-invalid': Boolean(errors[field]),
      'aria-describedby': describedBy || undefined,
    }
  }

  function fieldError(field: RegisterField) {
    return errors[field] ? <span className="request-field-error" id={`${inputIds[field]}-error`}>{errors[field]}</span> : null
  }

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>Skapa konto</h1>
        <p>Registrera dig som student och få tillgång till våra kurser och bokningar.</p>
      </div>

      <form className="test-lesson-form login-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form-grid">
          <div className="request-field">
            <label htmlFor={inputIds.firstName}>Förnamn</label>
            <input type="text" autoComplete="given-name" required maxLength={100} {...fieldProps('firstName')} />
            {fieldError('firstName')}
          </div>
          <div className="request-field">
            <label htmlFor={inputIds.lastName}>Efternamn</label>
            <input type="text" autoComplete="family-name" required maxLength={100} {...fieldProps('lastName')} />
            {fieldError('lastName')}
          </div>
          <div className="request-field">
            <label htmlFor={inputIds.phoneNumber}>Telefonnummer</label>
            <input type="tel" autoComplete="tel" required maxLength={50} placeholder="070-123 45 67" {...fieldProps('phoneNumber')} />
            {fieldError('phoneNumber')}
          </div>
          <div className="request-field">
            <label htmlFor={inputIds.email}>E-postadress</label>
            <input type="email" autoComplete="email" required maxLength={200} {...fieldProps('email')} />
            {fieldError('email')}
          </div>
          <div className="request-field">
            <label htmlFor={inputIds.password}>Lösenord</label>
            <input type="password" autoComplete="new-password" required {...fieldProps('password')} />
            <span id="register-password-rule" className="request-optional">{passwordRule}</span>
            {fieldError('password')}
          </div>
          <div className="request-field">
            <label htmlFor={inputIds.confirmPassword}>Bekräfta lösenord</label>
            <input type="password" autoComplete="new-password" required {...fieldProps('confirmPassword')} />
            {fieldError('confirmPassword')}
          </div>
        </div>

        {generalError && <p className="request-status request-status-error" role="alert">{generalError}</p>}

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
