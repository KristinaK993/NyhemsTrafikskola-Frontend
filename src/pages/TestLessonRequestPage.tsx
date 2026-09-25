import { useState, type FocusEvent, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createTestLessonRequest } from '../api/bookingApi'
import { BookingApiUnavailableError, isBookingApiConfigured } from '../api/client'
import type { TestLessonRequest } from '../api/types'

type FieldErrors = Partial<Record<keyof TestLessonRequest, string>>

const emptyRequest: TestLessonRequest = {
  fullName: '',
  phone: '',
  email: '',
  experience: '',
  preferredTimes: '',
  message: '',
}

function validateRequest(request: TestLessonRequest): FieldErrors {
  const errors: FieldErrors = {}
  const nameParts = request.fullName.trim().split(/\s+/)

  if (!request.fullName.trim()) {
    errors.fullName = 'Fyll i för- och efternamn.'
  } else if (nameParts.length < 2) {
    errors.fullName = 'Ange både förnamn och efternamn.'
  }

  const phoneDigits = request.phone.replace(/\D/g, '')
  if (!request.phone.trim()) {
    errors.phone = 'Fyll i ditt telefonnummer.'
  } else if (phoneDigits.length < 7) {
    errors.phone = 'Ange ett giltigt telefonnummer.'
  }

  if (!request.email.trim()) {
    errors.email = 'Fyll i din e-postadress.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())) {
    errors.email = 'Ange en giltig e-postadress.'
  }

  return errors
}

export function TestLessonRequestPage() {
  const [request, setRequest] = useState(emptyRequest)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'unavailable' | 'error'>('idle')

  function updateField(field: keyof TestLessonRequest, value: string) {
    setRequest((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus('idle')
  }

  function validateOnBlur(event: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.currentTarget.name as keyof TestLessonRequest
    if (!['fullName', 'phone', 'email'].includes(field)) return
    const fieldErrors = validateRequest(request)
    setErrors((current) => ({ ...current, [field]: fieldErrors[field] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateRequest(request)
    setErrors(nextErrors)
    setStatus('idle')

    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      document.getElementById(firstInvalidField)?.focus()
      return
    }

    setStatus('sending')
    try {
      await createTestLessonRequest({
        ...request,
        fullName: request.fullName.trim(),
        phone: request.phone.trim(),
        email: request.email.trim(),
        preferredTimes: request.preferredTimes.trim(),
        message: request.message.trim(),
      })
      setStatus('success')
      setRequest(emptyRequest)
    } catch (error) {
      setStatus(error instanceof BookingApiUnavailableError ? 'unavailable' : 'error')
    }
  }

  function fieldError(field: keyof TestLessonRequest) {
    return errors[field] ? <span className="request-field-error" id={`${field}-error`}>{errors[field]}</span> : null
  }

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>Förfrågan om testlektion</h1>
        <p>Skicka din förfrågan så kontaktar vi dig för att hitta en ledig tid. Din bokning är inte bekräftad förrän du har fått en bekräftelse från oss.</p>
      </div>

      <form className="test-lesson-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form-grid">
          <div className="request-field">
            <label htmlFor="fullName">För- och efternamn <span aria-hidden="true">*</span></label>
            <input id="fullName" name="fullName" autoComplete="name" value={request.fullName} onBlur={validateOnBlur} onChange={(event) => updateField('fullName', event.target.value)} required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
            {fieldError('fullName')}
          </div>

          <div className="request-field">
            <label htmlFor="phone">Telefonnummer <span aria-hidden="true">*</span></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" value={request.phone} onBlur={validateOnBlur} onChange={(event) => updateField('phone', event.target.value)} required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
            {fieldError('phone')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="email">E-postadress <span aria-hidden="true">*</span></label>
            <input id="email" name="email" type="email" autoComplete="email" value={request.email} onBlur={validateOnBlur} onChange={(event) => updateField('email', event.target.value)} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            {fieldError('email')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="experience">Tidigare körerfarenhet</label>
            <select id="experience" name="experience" value={request.experience} onChange={(event) => updateField('experience', event.target.value)}>
              <option value="">Välj ett alternativ</option>
              <option value="beginner">Nybörjare</option>
              <option value="private-practice">Övningskört privat</option>
              <option value="previous-lessons">Tagit körlektioner tidigare</option>
            </select>
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="preferredTimes">Önskemål om dagar eller tider</label>
            <textarea id="preferredTimes" name="preferredTimes" rows={3} value={request.preferredTimes} onChange={(event) => updateField('preferredTimes', event.target.value)} />
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="message">Övrigt meddelande <span className="request-optional">(valfritt)</span></label>
            <textarea id="message" name="message" rows={4} value={request.message} onChange={(event) => updateField('message', event.target.value)} />
          </div>
        </div>

        {status === 'unavailable' && <p className="request-status request-status-error" role="alert">Formuläret är inte anslutet till någon mottagare ännu. Din förfrågan har inte skickats.</p>}
        {!isBookingApiConfigured && <p className="riskettan-registration-status" role="status">Förfrågningsformuläret öppnar när bokningssystemet är tillgängligt. Dina uppgifter skickas inte nu.</p>}
        {status === 'error' && <p className="request-status request-status-error" role="alert">Det gick inte att skicka förfrågan. Försök igen senare eller kontakta trafikskolan på annat sätt.</p>}
        {status === 'success' && <p className="request-status request-status-success" role="status">Din förfrågan har skickats. Vi kontaktar dig för att hitta en ledig tid.</p>}

        <Button className="request-submit" type="submit" disabled={!isBookingApiConfigured || status === 'sending'}>
          {status === 'sending' ? 'Skickar…' : 'Skicka förfrågan'}
        </Button>
      </form>
    </section>
  )
}
