import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { useAuth } from '../auth/AuthContext'
import { ApiRequestError } from '../api/client'
import { cancelMyBooking, getMyUpcomingBookings, type StudentBooking } from '../api/studentBookingsApi'
import { formatSessionDate, formatSessionTimeRange } from '../components/sessionFormatting'

const priceFormatter = new Intl.NumberFormat('sv-SE')
const deadlineFormatter = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const cardStyle = { border: '1px solid #d4d4d8', padding: '1rem', borderRadius: '0.75rem' }

function courseName(booking: StudentBooking) {
  return booking.courseType === 'RiskettanMC' ? 'Riskettan MC' : 'Riskettan Bil'
}

function cancellationErrorText(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return 'Din inloggning har gått ut. Logga in igen och försök på nytt.'
    if (error.status === 400 && /csrf/i.test(error.message)) return 'Din session behöver förnyas. Ladda om sidan och försök igen.'
    if (error.status >= 500) return 'Avbokningen kunde inte genomföras på grund av ett tekniskt fel. Kontakta trafikskolan via telefon.'
    return error.message
  }
  if (error instanceof TypeError) return 'Kunde inte nå bokningssystemet. Kontrollera anslutningen och försök igen.'
  return 'Avbokningen kunde inte genomföras. Kontakta trafikskolan via telefon.'
}

type BookingCardProps = {
  booking: StudentBooking
  busy: boolean
  onCancelled: (booking: StudentBooking) => void
  onBusyChange: (busy: boolean) => void
  onRefreshNeeded: () => void
}

function BookingCard({ booking, busy, onCancelled, onBusyChange, onRefreshNeeded }: BookingCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestInFlight = useRef(false)
  const deadline = deadlineFormatter.format(new Date(booking.onlineCancellationDeadline))

  async function handleCancel() {
    if (requestInFlight.current) return
    requestInFlight.current = true
    setSending(true)
    onBusyChange(true)
    setError(null)

    try {
      await cancelMyBooking(booking.bookingId)
      onCancelled(booking)
    } catch (requestError) {
      setError(cancellationErrorText(requestError))
      if (requestError instanceof ApiRequestError && (requestError.status === 404 || requestError.status === 409)) onRefreshNeeded()
    } finally {
      requestInFlight.current = false
      setSending(false)
      onBusyChange(false)
    }
  }

  return (
    <li style={cardStyle} aria-busy={sending}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>{courseName(booking)}</p>
      <p style={{ margin: '0 0 0.25rem' }}>{formatSessionDate(booking.startTime)}, {formatSessionTimeRange(booking.startTime, booking.endTime)}</p>
      <p style={{ margin: '0 0 0.25rem' }}>Pris: {priceFormatter.format(booking.price)} kr</p>
      <p style={{ margin: '0 0 0.75rem' }}>Status: Bekräftad</p>

      {booking.onlineCancellation === 'Allowed' && !confirming && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>Du kan avboka online fram till {deadline}.</p>
          <Button variant="secondary" disabled={busy} onClick={() => { setError(null); setConfirming(true) }}>Avboka</Button>
        </>
      )}

      {booking.onlineCancellation === 'Allowed' && confirming && (
        <div role="group" aria-label="Bekräfta avbokning">
          <p style={{ margin: '0 0 0.5rem' }}>Vill du avboka {courseName(booking)} den {formatSessionDate(booking.startTime)}?</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button disabled={sending} onClick={() => { void handleCancel() }}>{sending ? 'Avbokar…' : 'Ja, avboka'}</Button>
            <Button variant="secondary" disabled={sending} onClick={() => setConfirming(false)}>Nej, behåll bokningen</Button>
          </div>
        </div>
      )}

      {booking.onlineCancellation === 'DeadlinePassed' && (
        <p style={{ margin: 0 }}>Tiden för avbokning online gick ut {deadline}. Avbokning sker nu endast via telefon.</p>
      )}

      {booking.onlineCancellation === 'ContactSchool' && (
        <p style={{ margin: 0 }}>Den här bokningen gjordes av trafikskolan. Kontakta oss via telefon för att avboka.</p>
      )}

      {error && <p className="request-status request-status-error" role="alert">{error}</p>}
    </li>
  )
}

function MyBookings() {
  const [bookings, setBookings] = useState<StudentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getMyUpcomingBookings()
      .then((items) => { if (active) { setBookings(items); setError(false) } })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [refreshCounter])

  function handleCancelled(booking: StudentBooking) {
    setBookings((current) => current.filter((item) => item.bookingId !== booking.bookingId))
    setCancelledMessage(`Din bokning av ${courseName(booking)} den ${formatSessionDate(booking.startTime)} är avbokad.`)
  }

  if (loading) return <p role="status">Hämtar dina bokningar…</p>
  if (error) return <p className="request-status request-status-error" role="alert">Dina bokningar kunde inte hämtas just nu. Försök igen senare.</p>

  return (
    <>
      {cancelledMessage && <p className="request-status request-status-success" role="status">{cancelledMessage}</p>}
      {bookings.length === 0 ? <p>Du har inga kommande bokningar.</p> : (
        <ul style={{ display: 'grid', gap: '1rem', marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              busy={busy}
              onCancelled={handleCancelled}
              onBusyChange={setBusy}
              onRefreshNeeded={() => setRefreshCounter((value) => value + 1)}
            />
          ))}
        </ul>
      )}
      <p style={{ marginTop: '1rem' }}>
        Betalning ska ske före kursstart. Avbokning kan göras online fram till 2 dygn (48 timmar) före kursstart. Därefter sker avbokning endast via telefon.
      </p>
    </>
  )
}

export function StudentPage() {
  const { user } = useAuth()
  const firstName = user?.firstName || 'elev'

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>Hej {firstName}!</h1>
        <p>Här kan du hantera dina bokningar och hitta kurser att boka.</p>
      </div>

      <div className="request-form-grid" style={{ marginTop: '2rem' }}>
        <div className="request-field request-field-full" id="mina-bokningar">
          <h2>MINA BOKNINGAR</h2>
          <MyBookings />
        </div>

        <div className="request-field request-field-full">
          <h2>BOKA KURS</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', ...cardStyle }}>
              <span>Riskettan Bil</span>
              <Button to="/riskettan-bil" variant="secondary">Se kurstillfällen</Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', ...cardStyle }}>
              <span>Riskettan MC</span>
              <Button to="/riskettan-mc" variant="secondary">Se kurstillfällen</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
