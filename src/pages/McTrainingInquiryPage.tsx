import { useState, type FocusEvent, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createMcTrainingInquiry } from '../api/bookingApi'
import { BookingApiUnavailableError, isBookingApiConfigured } from '../api/client'
import type { McTrainingInquiry } from '../api/types'

type InquiryErrors = Partial<Record<keyof McTrainingInquiry, string>>

const initialInquiry: McTrainingInquiry = {
  fullName: '',
  phone: '',
  email: '',
  licence: '',
  experience: '',
  preferredTimes: '',
  message: '',
}

const requiredFields: (keyof McTrainingInquiry)[] = ['fullName', 'phone', 'email']

function getFieldError(field: keyof McTrainingInquiry, value: string) {
  if (field === 'fullName') {
    if (!value.trim()) return 'Fyll i för- och efternamn.'
    if (value.trim().split(/\s+/).length < 2) return 'Ange både förnamn och efternamn.'
  }
  if (field === 'phone') {
    if (!value.trim()) return 'Fyll i ditt telefonnummer.'
    if (value.replace(/\D/g, '').length < 7) return 'Ange ett giltigt telefonnummer.'
  }
  if (field === 'email') {
    if (!value.trim()) return 'Fyll i din e-postadress.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Ange en giltig e-postadress.'
  }
  return undefined
}

export function McTrainingInquiryPage() {
  const [inquiry, setInquiry] = useState(initialInquiry)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'received' | 'unavailable' | 'error'>('idle')

  function updateField(field: keyof McTrainingInquiry, value: string) {
    setInquiry((current) => ({ ...current, [field]: value }))
    if (errors[field] !== undefined) {
      setErrors((current) => ({ ...current, [field]: getFieldError(field, value) }))
    }
  }

  function validateOnBlur(event: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.currentTarget.name as keyof McTrainingInquiry
    if (!requiredFields.includes(field)) return
    setErrors((current) => ({ ...current, [field]: getFieldError(field, inquiry[field]) }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: InquiryErrors = {}
    for (const field of requiredFields) nextErrors[field] = getFieldError(field, inquiry[field])
    setErrors(nextErrors)
    const firstInvalid = requiredFields.find((field) => nextErrors[field])
    if (firstInvalid) {
      document.getElementById(`mc-${firstInvalid}`)?.focus()
      return
    }
    if (!isBookingApiConfigured) {
      setStatus('unavailable')
      return
    }

    setStatus('sending')
    try {
      await createMcTrainingInquiry({
        ...inquiry,
        fullName: inquiry.fullName.trim(),
        phone: inquiry.phone.trim(),
        email: inquiry.email.trim(),
        experience: inquiry.experience.trim(),
        preferredTimes: inquiry.preferredTimes.trim(),
        message: inquiry.message.trim(),
      })
      setStatus('received')
    } catch (error) {
      setStatus(error instanceof BookingApiUnavailableError ? 'unavailable' : 'error')
    }
  }

  return (
    <section className="request-page mc-inquiry-page">
      <div className="request-page-heading">
        <h1>Förfrågan om MC-utbildning</h1>
        <p>Skicka din förfrågan så kontaktar vi dig för att diskutera din utbildning och möjliga tider. En förfrågan är inte en bekräftad bokning.</p>
      </div>

      <form className="test-lesson-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form-grid">
          <div className="request-field">
            <label htmlFor="mc-fullName">För- och efternamn <span aria-hidden="true">*</span></label>
            <input id="mc-fullName" name="fullName" autoComplete="name" required value={inquiry.fullName} onBlur={validateOnBlur} onChange={(event) => updateField('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'mc-fullName-error' : undefined} />
            {errors.fullName && <span className="request-field-error" id="mc-fullName-error">{errors.fullName}</span>}
          </div>

          <div className="request-field">
            <label htmlFor="mc-phone">Telefonnummer <span aria-hidden="true">*</span></label>
            <input id="mc-phone" name="phone" type="tel" autoComplete="tel" required value={inquiry.phone} onBlur={validateOnBlur} onChange={(event) => updateField('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'mc-phone-error' : undefined} />
            {errors.phone && <span className="request-field-error" id="mc-phone-error">{errors.phone}</span>}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-email">E-postadress <span aria-hidden="true">*</span></label>
            <input id="mc-email" name="email" type="email" autoComplete="email" required value={inquiry.email} onBlur={validateOnBlur} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'mc-email-error' : undefined} />
            {errors.email && <span className="request-field-error" id="mc-email-error">{errors.email}</span>}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-licence">Intresserad av behörighet</label>
            <select id="mc-licence" name="licence" value={inquiry.licence} onChange={(event) => updateField('licence', event.target.value)}>
              <option value="">Välj behörighet</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A">A</option>
              <option value="unsure">Osäker</option>
            </select>
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-experience">Tidigare erfarenhet av MC-körning <span className="request-optional">(valfritt)</span></label>
            <textarea id="mc-experience" name="experience" rows={3} value={inquiry.experience} onChange={(event) => updateField('experience', event.target.value)} />
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-preferredTimes">Önskemål om dagar eller tider <span className="request-optional">(valfritt)</span></label>
            <textarea id="mc-preferredTimes" name="preferredTimes" rows={3} value={inquiry.preferredTimes} onChange={(event) => updateField('preferredTimes', event.target.value)} />
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-message">Övrigt meddelande <span className="request-optional">(valfritt)</span></label>
            <textarea id="mc-message" name="message" rows={4} value={inquiry.message} onChange={(event) => updateField('message', event.target.value)} />
          </div>
        </div>

        {!isBookingApiConfigured && <p className="riskettan-registration-status" role="status">Formuläret öppnar när bokningssystemet är tillgängligt. Dina uppgifter skickas inte nu.</p>}
        {status === 'received' && <p className="request-status" role="status">Förfrågan mottagen. En bokning är inte bekräftad.</p>}
        {status === 'unavailable' && <p className="request-status request-status-error" role="alert">Bokningssystemet är inte tillgängligt. Dina uppgifter har inte skickats.</p>}
        {status === 'error' && <p className="request-status request-status-error" role="alert">Förfrågan kunde inte skickas. Dina uppgifter har inte bekräftats mottagna.</p>}
        <Button className="request-submit" type="submit" disabled={!isBookingApiConfigured || status === 'sending'}>
          {status === 'sending' ? 'Skickar…' : 'Skicka förfrågan'}
        </Button>
      </form>
    </section>
  )
}
