import { useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { bookCourseSession, type PublicCourseSession, type StudentBookingResult } from '../api/courseSessionsApi'
import { ApiRequestError, BookingApiUnavailableError } from '../api/client'
import { Button } from './Button'
import { formatSessionDate, formatSessionTimeRange } from './sessionFormatting'

type RiskettanBookingFormProps = {
  session: PublicCourseSession
  onCancel: () => void
  onBooked: (result: StudentBookingResult) => void
  onSessionUnavailable: () => void
  onSendingChange: (sending: boolean) => void
}

const priceFormatter = new Intl.NumberFormat('sv-SE')

function bookingErrorText(error: unknown) {
  if (error instanceof BookingApiUnavailableError) return error.message
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return 'Din inloggning har gått ut. Logga in igen och försök på nytt.'
    if (error.status === 403) return 'Endast elevkonton kan boka kurser.'
    if (error.status === 400 && /csrf/i.test(error.message)) return 'Din session behöver förnyas. Ladda om sidan och försök igen.'
    if (error.status >= 500) return 'Bokningen kunde inte genomföras på grund av ett tekniskt fel. Försök igen senare.'
    return error.message
  }
  if (error instanceof TypeError) return 'Kunde inte nå bokningssystemet. Kontrollera anslutningen och försök igen.'
  return error instanceof Error ? error.message : 'Bokningen kunde inte genomföras. Försök igen senare.'
}

export function RiskettanBookingForm({ session, onCancel, onBooked, onSessionUnavailable, onSendingChange }: RiskettanBookingFormProps) {
  const { user } = useAuth()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const requestInFlight = useRef(false)

  const courseName = session.courseType === 'RiskettanMC' ? 'Riskettan MC' : 'Riskettan Bil'
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  const phoneNumber = user?.phoneNumber?.trim() ?? ''
  const canConfirm = termsAccepted && !sending && Boolean(user) && Boolean(phoneNumber)

  async function handleConfirmBooking() {
    if (!canConfirm || requestInFlight.current) return

    requestInFlight.current = true
    setSending(true)
    onSendingChange(true)
    setErrorMessage(null)

    try {
      const result = await bookCourseSession(session.courseSessionId)
      onBooked(result)
    } catch (error) {
      setErrorMessage(bookingErrorText(error))
      if (error instanceof ApiRequestError && (error.status === 404 || error.status === 409)) onSessionUnavailable()
    } finally {
      requestInFlight.current = false
      setSending(false)
      onSendingChange(false)
    }
  }

  return (
    <div className="request-field request-field-full" style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #d4d4d8', borderRadius: '0.75rem' }} aria-busy={sending}>
      <h2 style={{ marginTop: 0 }}>Bokningssammanfattning</h2>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div><strong>Kurs:</strong> {courseName}</div>
        <div><strong>Datum:</strong> {formatSessionDate(session.startTime)}</div>
        <div><strong>Tid:</strong> {formatSessionTimeRange(session.startTime, session.endTime)}</div>
        <div><strong>Pris:</strong> {priceFormatter.format(session.price)} kr</div>
        <div><strong>Elevens namn:</strong> {fullName || 'Namn saknas'}</div>
        <div><strong>E-post:</strong> {user?.email || 'E-post saknas'}</div>
        <div><strong>Telefonnummer:</strong> {phoneNumber || 'Telefonnummer saknas'}</div>
      </div>

      {!phoneNumber && (
        <p className="request-status request-status-error" role="alert">
          Ditt konto saknar telefonnummer. Kontakta trafikskolan för att komplettera dina uppgifter innan du bokar.
        </p>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Boknings- och avbokningsvillkor</h3>
        <ul style={{ paddingLeft: '1.25rem', margin: '0.75rem 0 1rem' }}>
          <li>Kursen kostar {priceFormatter.format(session.price)} kr. Betalning ska ske före kursstart.</li>
          <li>Anmälan är bindande.</li>
          <li>Avbokning kan göras online under Mina bokningar fram till 2 dygn (48 timmar) före kursstart. Därefter sker avbokning endast via telefon.</li>
          <li>Vid för sen avbokning eller uteblivet deltagande debiteras 50 % av kurspriset.</li>
          <li>Vid akuta händelser godtas läkarintyg.</li>
          <li>Legitimation kontrolleras vid kurstillfället.</li>
          <li>Nyhems Trafikskola kan ställa in kursen, exempelvis vid sjukdom eller för få deltagare.</li>
        </ul>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1rem' }}>
        <input type="checkbox" checked={termsAccepted} disabled={sending} onChange={(event) => setTermsAccepted(event.target.checked)} />
        <span>Jag har läst och godkänner boknings- och avbokningsvillkoren.</span>
      </label>

      {sending && <p className="request-status" role="status">Bokningen skickas…</p>}
      {errorMessage && <p className="request-status request-status-error" role="alert">{errorMessage}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <Button className="request-submit" onClick={() => { void handleConfirmBooking() }} disabled={!canConfirm}>
          {sending ? 'Bokar…' : 'Bekräfta bokning'}
        </Button>
        <Button className="request-submit request-submit-secondary" variant="secondary" onClick={onCancel} disabled={sending}>
          Avbryt
        </Button>
      </div>
    </div>
  )
}
