import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getPublicCourseSessions, type PublicCourseSession, type StudentBookingResult } from '../api/courseSessionsApi'
import { InformationPage } from '../components/InformationPage'
import { Button } from '../components/Button'
import { RiskettanBookingForm } from '../components/RiskettanBookingForm'
import { formatSessionDate, formatSessionTimeRange } from '../components/sessionFormatting'

function formatSeatsText(availableSeats: number) {
  if (availableSeats <= 0) return 'Fullbokad'
  return `${availableSeats} ${availableSeats === 1 ? 'plats' : 'platser'} kvar`
}

type RiskettanSessionListProps = {
  courseType: 'RiskettanBil' | 'RiskettanMC'
  title: string
  subtitle: string
}

function RiskettanSessionList({ courseType, title, subtitle }: RiskettanSessionListProps) {
  const [sessions, setSessions] = useState<PublicCourseSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let active = true

    getPublicCourseSessions(courseType)
      .then((items) => {
        if (!active) return
        setError(null)
        setSessions([...items].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()))
      })
      .catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Kunde inte hämta kurstillfällen.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [courseType, refreshCounter])

  useEffect(() => {
    if (confirmation) confirmationRef.current?.focus()
  }, [confirmation])

  function handleBooked(session: PublicCourseSession, result: StudentBookingResult) {
    const courseName = session.courseType === 'RiskettanMC' ? 'Riskettan MC' : 'Riskettan Bil'
    setSessions((current) => current.map((item) => (
      item.courseSessionId === result.courseSessionId ? { ...item, availableSeats: result.availableSeats } : item
    )))
    setSelectedSessionId(null)
    setConfirmation(`Din bokning är bekräftad: ${courseName} den ${formatSessionDate(session.startTime)}, ${formatSessionTimeRange(session.startTime, session.endTime)}. Betalning ska ske före kursstart.`)
    setRefreshCounter((value) => value + 1)
  }

  return (
    <section className="request-page">
      <div className="request-page-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {confirmation && (
        <div>
          <p ref={confirmationRef} tabIndex={-1} className="request-status request-status-success" role="status">
            {confirmation}
          </p>
          <Button to="/elev" variant="secondary">Visa mina bokningar</Button>
        </div>
      )}

      {loading && <p className="request-status">Laddar kurstillfällen…</p>}

      {!loading && error && (
        <p className="request-status request-status-error" role="alert">
          Kunde inte hämta bokningsbara kurstillfällen just nu. Försök igen senare.
        </p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <p className="request-status">Det finns inga bokningsbara kurstillfällen just nu.</p>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="request-form-grid" style={{ marginTop: '2rem' }}>
          {sessions.map((session) => {
            const isFull = session.availableSeats <= 0
            const isSelected = session.courseSessionId === selectedSessionId

            return (
              <article key={session.courseSessionId} className="request-field request-field-full" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>{formatSessionDate(session.startTime)}</p>
                    <p style={{ margin: '0 0 0.5rem' }}>{formatSessionTimeRange(session.startTime, session.endTime)}</p>
                    <p style={{ margin: 0 }}>{formatSeatsText(session.availableSeats)}</p>
                  </div>

                  {!isSelected && (
                    <button
                      type="button"
                      disabled={isFull || bookingInProgress}
                      onClick={() => {
                        setConfirmation(null)
                        setSelectedSessionId(session.courseSessionId)
                      }}
                      style={{ minWidth: '120px' }}
                    >
                      {isFull ? 'Fullbokad' : 'Boka'}
                    </button>
                  )}
                </div>

                {isSelected && (
                  <RiskettanBookingForm
                    key={session.courseSessionId}
                    session={session}
                    onCancel={() => setSelectedSessionId(null)}
                    onBooked={(result) => handleBooked(session, result)}
                    onSessionUnavailable={() => setRefreshCounter((value) => value + 1)}
                    onSendingChange={setBookingInProgress}
                  />
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function RiskettanBilPage() {
  const { user } = useAuth()
  const isStudent = user?.roles.some((role) => role.toLowerCase() === 'student') ?? false

  if (isStudent) {
    return <RiskettanSessionList courseType="RiskettanBil" title="Riskettan bil" subtitle="Välj ett bokningsbart kurstillfälle för Riskettan Bil." />
  }

  return (
    <InformationPage
      title="Riskettan bil"
      description="Riskettan är en del av riskutbildningen för B-körkort. För att boka behöver du ett elevkonto och vara inloggad."
      actions={<Button to="/bokning-riskettan-bil">Boka Riskettan bil</Button>}
    />
  )
}

export function RiskettanMcPage() {
  const { user } = useAuth()
  const isStudent = user?.roles.some((role) => role.toLowerCase() === 'student') ?? false

  if (isStudent) {
    return <RiskettanSessionList courseType="RiskettanMC" title="Riskettan MC" subtitle="Välj ett bokningsbart kurstillfälle för Riskettan MC." />
  }

  return (
    <>
      <InformationPage
        title="Riskettan MC"
        description="Riskettan är den teoretiska delen av den obligatoriska riskutbildningen för motorcykelkörkort."
        image="/images/IMG_1220.jpeg"
        imageAlt="MC-elev på motorcykel under utbildning hos Nyhems Trafikskola"
      />

      <section className="mc-risk-info" aria-label="Information om Riskettan MC">
        <div className="mc-risk-info-grid">
          <article className="mc-course-card" aria-labelledby="mc-risk-what">
            <h2 id="mc-risk-what">Vad är Riskettan MC?</h2>
            <p>Kursen tar upp risker vid motorcykelkörning och hur beteenden och beslut påverkar säkerheten. Du får också prata om hur riskfyllda situationer kan förebyggas.</p>
          </article>

          <article className="mc-course-card" aria-labelledby="mc-risk-content">
            <h2 id="mc-risk-content">Vad går vi igenom?</h2>
            <ul className="mc-risk-topic-list">
              <li>Riskmedvetenhet och riskfyllda beteenden</li>
              <li>Alkohol, droger och trötthet</li>
              <li>Hastighet och säkerhetsmarginaler</li>
              <li>Motorcyklistens utsatthet i trafiken</li>
            </ul>
          </article>

          <article className="mc-course-card" aria-labelledby="mc-risk-who">
            <h2 id="mc-risk-who">Vem behöver gå kursen?</h2>
            <p>Riskettan MC ingår i riskutbildningen för MC-körkort. Den här kursen gäller motorcykel och är separat från Riskettan för bil.</p>
          </article>

          <article className="mc-risk-apply" aria-labelledby="mc-risk-apply-heading">
            <div>
              <h2 id="mc-risk-apply-heading">Pris och anmälan</h2>
              <p className="mc-course-price">Se aktuellt pris i bokningsflödet</p>
              <p>För att boka behöver du ett elevkonto och vara inloggad.</p>
            </div>
            <Button to="/bokning-riskettan-mc">Boka Riskettan MC</Button>
          </article>
        </div>
      </section>
    </>
  )
}
