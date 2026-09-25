import { useEffect, useState, type FocusEvent, type FormEvent } from 'react'
import { bookRiskettanCourse, getPublishedRiskettanSessions } from '../api/bookingApi'
import { BookingApiUnavailableError, isBookingApiConfigured } from '../api/client'
import type { PublishedRiskettanSession, RiskettanCourse } from '../api/types'
import { Button } from './Button'

type RiskettanBookingFormProps = {
  course: RiskettanCourse
  price: number
}

type BookingFields = {
  fullName: string
  phone: string
  email: string
  sessionId: string
  message: string
}

type BookingErrors = Partial<Record<keyof BookingFields, string>>
type SubmissionState = 'idle' | 'sending' | 'confirmed' | 'pending' | 'unavailable' | 'error'

const priceFormatter = new Intl.NumberFormat('sv-SE')
const requiredFields: (keyof BookingFields)[] = ['fullName', 'phone', 'email', 'sessionId']

function validateField(field: keyof BookingFields, value: string) {
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
  if (field === 'sessionId' && !value) return 'Välj ett publicerat kurstillfälle.'
  return undefined
}

export function RiskettanBookingForm({ course, price }: RiskettanBookingFormProps) {
  const isMc = course === 'mc'
  const [sessions, setSessions] = useState<PublishedRiskettanSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(isBookingApiConfigured)
  const [sessionError, setSessionError] = useState(false)
  const [fields, setFields] = useState<BookingFields>({ fullName: '', phone: '', email: '', sessionId: '', message: '' })
  const [errors, setErrors] = useState<BookingErrors>({})
  const [status, setStatus] = useState<SubmissionState>(isBookingApiConfigured ? 'idle' : 'unavailable')

  useEffect(() => {
    if (!isBookingApiConfigured) return
    let active = true
    getPublishedRiskettanSessions(course)
      .then((publishedSessions) => {
        if (active) setSessions(publishedSessions.filter((session) => session.course === course && session.availablePlaces > 0))
      })
      .catch(() => {
        if (active) setSessionError(true)
      })
      .finally(() => {
        if (active) setSessionsLoading(false)
      })
    return () => { active = false }
  }, [course])

  const title = isMc ? 'Bokning av Riskettan MC' : 'Bokning av Riskettan bil'
  const canSubmit = isBookingApiConfigured && !sessionsLoading && sessions.length > 0 && status !== 'sending'

  function updateField(field: keyof BookingFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }))
    if (errors[field] !== undefined) setErrors((current) => ({ ...current, [field]: validateField(field, value) }))
  }

  function validateOnBlur(event: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.currentTarget.name as keyof BookingFields
    if (!requiredFields.includes(field)) return
    setErrors((current) => ({ ...current, [field]: validateField(field, fields[field]) }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: BookingErrors = {}
    for (const field of requiredFields) nextErrors[field] = validateField(field, fields[field])
    setErrors(nextErrors)
    const firstInvalid = requiredFields.find((field) => nextErrors[field])
    if (firstInvalid) {
      document.getElementById(`risk-${course}-${firstInvalid}`)?.focus()
      return
    }
    if (!canSubmit) return

    const selectedSession = sessions.find((session) => session.id === fields.sessionId)
    if (!selectedSession) {
      setErrors((current) => ({ ...current, sessionId: 'Välj ett publicerat kurstillfälle.' }))
      return
    }

    setStatus('sending')
    try {
      const response = await bookRiskettanCourse({
        course,
        sessionId: selectedSession.id,
        fullName: fields.fullName.trim(),
        phone: fields.phone.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
      })
      setStatus(response.status)
    } catch (error) {
      setStatus(error instanceof BookingApiUnavailableError ? 'unavailable' : 'error')
    }
  }

  function fieldError(field: keyof BookingFields) {
    return errors[field] ? <span className="request-field-error" id={`risk-${course}-${field}-error`}>{errors[field]}</span> : null
  }

  return (
    <section className="request-page riskettan-registration-page">
      <div className="request-page-heading">
        <h1>{title}</h1>
        <p>Välj ett publicerat kurstillfälle och fyll i dina uppgifter. Bokningen är klar först när du får en bekräftelse.</p>
        <p className="riskettan-price">Pris: <strong>{priceFormatter.format(price)} kr</strong></p>
        {sessionsLoading && <p role="status">Hämtar publicerade kurstillfällen…</p>}
        {!sessionsLoading && !sessions.length && !sessionError && <p className="riskettan-registration-status" role="status">Kurstillfällen är ännu inte publicerade.</p>}
        {sessionError && <p className="request-status request-status-error" role="alert">Kurstillfällen kunde inte hämtas. Försök igen senare.</p>}
        {!isBookingApiConfigured && <p className="riskettan-registration-status" role="status">Bokningssystemet är inte aktiverat ännu. Formuläret tar inte emot bokningar.</p>}
      </div>

      <form className="test-lesson-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form-grid">
          <div className="request-field request-field-full">
            <label htmlFor={`risk-${course}-sessionId`}>Kurstillfälle <span aria-hidden="true">*</span></label>
            <select id={`risk-${course}-sessionId`} name="sessionId" required value={fields.sessionId} onBlur={validateOnBlur} onChange={(event) => updateField('sessionId', event.target.value)} aria-invalid={Boolean(errors.sessionId)} aria-describedby={errors.sessionId ? `risk-${course}-sessionId-error` : undefined} disabled={!sessions.length}>
              <option value="">{sessions.length ? 'Välj kurstillfälle' : 'Inga publicerade tillfällen'}</option>
              {sessions.map((session) => <option key={session.id} value={session.id}>{session.label}</option>)}
            </select>
            {fieldError('sessionId')}
          </div>

          <div className="request-field">
            <label htmlFor={`risk-${course}-fullName`}>För- och efternamn <span aria-hidden="true">*</span></label>
            <input id={`risk-${course}-fullName`} name="fullName" autoComplete="name" required value={fields.fullName} onBlur={validateOnBlur} onChange={(event) => updateField('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? `risk-${course}-fullName-error` : undefined} />
            {fieldError('fullName')}
          </div>

          <div className="request-field">
            <label htmlFor={`risk-${course}-phone`}>Telefonnummer <span aria-hidden="true">*</span></label>
            <input id={`risk-${course}-phone`} name="phone" type="tel" autoComplete="tel" required value={fields.phone} onBlur={validateOnBlur} onChange={(event) => updateField('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? `risk-${course}-phone-error` : undefined} />
            {fieldError('phone')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor={`risk-${course}-email`}>E-postadress <span aria-hidden="true">*</span></label>
            <input id={`risk-${course}-email`} name="email" type="email" autoComplete="email" required value={fields.email} onBlur={validateOnBlur} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `risk-${course}-email-error` : undefined} />
            {fieldError('email')}
          </div>

          <div className="request-field request-field-full">
            <label htmlFor={`risk-${course}-message`}>Övrigt meddelande <span className="request-optional">(valfritt)</span></label>
            <textarea id={`risk-${course}-message`} name="message" rows={4} value={fields.message} onChange={(event) => updateField('message', event.target.value)} />
          </div>
        </div>

        {status === 'confirmed' && <p className="request-status request-status-success" role="status">Din bokning är bekräftad.</p>}
        {status === 'pending' && <p className="request-status" role="status">Bokningsförfrågan mottagen. Din plats är inte bekräftad ännu.</p>}
        {status === 'error' && <p className="request-status request-status-error" role="alert">Bokningen kunde inte genomföras. Försök igen senare.</p>}
        <Button className="request-submit" type="submit" disabled={!canSubmit}>
          {status === 'sending' ? 'Skickar…' : isMc ? 'Boka Riskettan MC' : 'Boka Riskettan bil'}
        </Button>
      </form>
    </section>
  )
}
