import { useState, type FocusEvent, type FormEvent } from 'react'
import { createRisktvaanMcInquiry } from '../api/bookingApi'
import { BookingApiUnavailableError, isBookingApiConfigured } from '../api/client'
import type { RisktvaanMcInquiry } from '../api/types'
import { mcRisktvaanPrice } from '../data/prices'
import { Button } from './Button'

type InquiryErrors = Partial<Record<keyof RisktvaanMcInquiry, string>>
type InquiryStatus = 'idle' | 'sending' | 'received' | 'unavailable' | 'error'

const priceFormatter = new Intl.NumberFormat('sv-SE')
const initialInquiry: RisktvaanMcInquiry = {
  fullName: '',
  phone: '',
  email: '',
  message: '',
  licence: '',
  experience: '',
  preferredTimes: '',
}
const requiredFields: (keyof RisktvaanMcInquiry)[] = ['fullName', 'phone', 'email']

function getFieldError(field: keyof RisktvaanMcInquiry, value: string) {
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

export function RisktvaanMcInquiryForm() {
  const [inquiry, setInquiry] = useState(initialInquiry)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [status, setStatus] = useState<InquiryStatus>('idle')

  function updateField(field: keyof RisktvaanMcInquiry, value: string) {
    setInquiry((current) => ({ ...current, [field]: value }))
    if (errors[field] !== undefined) setErrors((current) => ({ ...current, [field]: getFieldError(field, value) }))
    setStatus('idle')
  }

  function validateOnBlur(event: FocusEvent<HTMLInputElement>) {
    const field = event.currentTarget.name as keyof RisktvaanMcInquiry
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
      document.getElementById(`mc-risktvaan-${firstInvalid}`)?.focus()
      return
    }
    if (!isBookingApiConfigured) {
      setStatus('unavailable')
      return
    }

    setStatus('sending')
    try {
      await createRisktvaanMcInquiry({
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

  function fieldError(field: keyof RisktvaanMcInquiry) {
    return errors[field] ? <span className="request-field-error" id={`mc-risktvaan-${field}-error`}>{errors[field]}</span> : null
  }

  return (
    <section className="request-page mc-inquiry-page">
      <div className="request-page-heading">
        <h1>Förfrågan om Risktvåan MC</h1>
        <p>Skicka din förfrågan så kontaktar vi dig för att planera utbildningen. Din plats är inte bokad förrän du har fått en bekräftelse från oss.</p>
        <p className="riskettan-price">Pris: <strong>{priceFormatter.format(mcRisktvaanPrice)} kr</strong></p>
        {!isBookingApiConfigured && <p className="riskettan-registration-status" role="status">Formuläret öppnar när bokningssystemet är tillgängligt. Dina uppgifter skickas inte nu.</p>}
      </div>

      <form className="test-lesson-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form-grid">
          <div className="request-field">
            <label htmlFor="mc-risktvaan-fullName">För- och efternamn <span aria-hidden="true">*</span></label>
            <input id="mc-risktvaan-fullName" name="fullName" autoComplete="name" required value={inquiry.fullName} onBlur={validateOnBlur} onChange={(event) => updateField('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'mc-risktvaan-fullName-error' : undefined} />
            {fieldError('fullName')}
          </div>

          <div className="request-field">
            <label htmlFor="mc-risktvaan-phone">Telefonnummer <span aria-hidden="true">*</span></label>
            <input id="mc-risktvaan-phone" name="phone" type="tel" autoComplete="tel" required value={inquiry.phone} onBlur={validateOnBlur} onChange={(event) => updateField('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'mc-risktvaan-phone-error' : undefined} />
            {fieldError('phone')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-risktvaan-email">E-postadress <span aria-hidden="true">*</span></label>
            <input id="mc-risktvaan-email" name="email" type="email" autoComplete="email" required value={inquiry.email} onBlur={validateOnBlur} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'mc-risktvaan-email-error' : undefined} />
            {fieldError('email')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-risktvaan-licence">MC-behörighet</label>
            <select id="mc-risktvaan-licence" name="licence" value={inquiry.licence} onChange={(event) => updateField('licence', event.target.value as RisktvaanMcInquiry['licence'])}>
              <option value="">Välj behörighet</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A">A</option>
              <option value="unsure">Osäker</option>
            </select>
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-risktvaan-experience">Tidigare erfarenhet av MC-körning</label>
            <textarea id="mc-risktvaan-experience" name="experience" rows={3} value={inquiry.experience} onChange={(event) => updateField('experience', event.target.value)} />
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-risktvaan-preferredTimes">Önskemål om dagar eller tider</label>
            <textarea id="mc-risktvaan-preferredTimes" name="preferredTimes" rows={3} value={inquiry.preferredTimes} onChange={(event) => updateField('preferredTimes', event.target.value)} />
          </div>

          <div className="request-field request-field-full">
            <label htmlFor="mc-risktvaan-message">Övrigt meddelande <span className="request-optional">(valfritt)</span></label>
            <textarea id="mc-risktvaan-message" name="message" rows={4} value={inquiry.message} onChange={(event) => updateField('message', event.target.value)} />
          </div>
        </div>

        {status === 'received' && <p className="request-status" role="status">Förfrågan mottagen. Din plats är inte bokad förrän du har fått en bekräftelse.</p>}
        {status === 'unavailable' && <p className="request-status request-status-error" role="alert">Bokningssystemet är inte tillgängligt ännu. Dina uppgifter har inte skickats.</p>}
        {status === 'error' && <p className="request-status request-status-error" role="alert">Förfrågan kunde inte skickas. Dina uppgifter har inte bekräftats mottagna.</p>}
        <Button className="request-submit" type="submit" disabled={!isBookingApiConfigured || status === 'sending'}>
          {status === 'sending' ? 'Skickar…' : 'Skicka förfrågan om Risktvåan MC'}
        </Button>
      </form>
    </section>
  )
}
