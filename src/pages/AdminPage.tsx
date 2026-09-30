import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiRequestError, BookingApiUnavailableError, isApiConfigured } from '../api/client'
import {
  bookAdminStudent,
  createAdminCourseSession,
  cancelAdminBooking,
  cancelAdminCourseSession,
  archiveAdminCourseSession,
  deleteAdminCourseSession,
  getAdminCourseSessionDetails,
  getAdminCourses,
  getAdminCourseSessions,
  setAdminCourseSessionPublished,
  updateAdminCourseSession,
  type AdminCourse,
  type AdminCourseSessionDetails,
  type AdminCourseSession,
  type ManualBookingInput,
} from '../api/adminCourseSessionsApi'

type Course = 'car' | 'mc'
type SessionTab = 'upcoming' | 'past' | 'cancelled' | 'archived'
type SessionForm = { startTime: string; endTime: string; capacity: string }
type ManualStudentForm = ManualBookingInput
const courseNames: Record<Course, string> = { car: 'Riskettan Bil', mc: 'Riskettan MC' }
const dateFormatter = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' })
const timeFormatter = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' })
const emptyForm: SessionForm = { startTime: '', endTime: '', capacity: '16' }
const emptyManualStudent: ManualStudentForm = { firstName: '', lastName: '', phone: '', email: '' }

function toLocalInput(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromLocalInput(value: string) {
  return new Date(value).toISOString()
}

function errorText(error: unknown) {
  if (error instanceof BookingApiUnavailableError) return 'API-adressen är inte konfigurerad. Kontrollera VITE_DOTNET_API_BASE_URL.'
  if (error instanceof ApiRequestError && error.status === 401) return 'Din inloggning har gått ut. Logga in igen.'
  if (error instanceof ApiRequestError && error.status === 403) return 'Ditt konto saknar behörighet att administrera kurstillfällen.'
  if (error instanceof ApiRequestError && error.status === 409 && /booking history/i.test(error.message)) {
    return 'Kurstillfället har bokningshistorik och kan därför inte tas bort. Bokningshistoriken har lämnats orörd.'
  }
  if (error instanceof ApiRequestError && error.status === 409) {
    if (/full/i.test(error.message)) return 'Kurstillfället är fullt. Det finns inga lediga platser kvar.'
    if (/already has an active booking/i.test(error.message)) return 'Eleven har redan en aktiv bokning på det här kurstillfället.'
    if (/cancelled/i.test(error.message)) return 'Det inställda kurstillfället kan inte ta emot bokningar.'
    if (/archived/i.test(error.message)) return 'Det arkiverade kurstillfället kan inte ta emot bokningar.'
  }
  if (error instanceof ApiRequestError && error.status === 400) {
    if (/email/i.test(error.message)) return 'Ange en giltig e-postadress.'
    if (/phone/i.test(error.message)) return 'Ange ett giltigt telefonnummer.'
    if (/first name/i.test(error.message)) return 'Ange ett giltigt förnamn (högst 100 tecken).'
    if (/last name/i.test(error.message)) return 'Ange ett giltigt efternamn (högst 100 tecken).'
  }
  return error instanceof Error ? error.message : 'Åtgärden kunde inte genomföras.'
}

function displayDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Ogiltigt datum' : `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`
}

function SessionFields({ form, onChange }: { form: SessionForm; onChange: (form: SessionForm) => void }) {
  return <div className="admin-form-grid">
    <label className="request-field"><span>Starttid</span><input type="datetime-local" required value={form.startTime} onChange={(event) => onChange({ ...form, startTime: event.target.value })} /></label>
    <label className="request-field"><span>Sluttid</span><input type="datetime-local" required value={form.endTime} onChange={(event) => onChange({ ...form, endTime: event.target.value })} /></label>
    <label className="request-field"><span>Fast kapacitet: 16 platser</span><input type="number" value="16" readOnly aria-label="Fast kapacitet, 16 platser" /></label>
  </div>
}

export function AdminPage() {
  const [sessions, setSessions] = useState<AdminCourseSession[]>([])
  const [archivedSessions, setArchivedSessions] = useState<AdminCourseSession[]>([])
  const [activeTab, setActiveTab] = useState<SessionTab>('upcoming')
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(isApiConfigured)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [createCourse, setCreateCourse] = useState<Course | null>(null)
  const [createCourseId, setCreateCourseId] = useState('')
  const [createForm, setCreateForm] = useState<SessionForm>(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<SessionForm>(emptyForm)
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<AdminCourseSessionDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [manualBookingOpen, setManualBookingOpen] = useState(false)
  const [manualBookingForm, setManualBookingForm] = useState<ManualStudentForm>(emptyManualStudent)
  const [manualBookingError, setManualBookingError] = useState<string | null>(null)
  const [manualBookingSuccess, setManualBookingSuccess] = useState<string | null>(null)

  const loadSessions = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const [adminSessions, archived, availableCourses] = await Promise.all([getAdminCourseSessions(), getAdminCourseSessions(true), getAdminCourses()])
      setSessions(adminSessions)
      setArchivedSessions(archived)
      setCourses(availableCourses)
    } catch (loadError) {
      setError(errorText(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void loadSessions() }, [loadSessions])

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime)), [sessions])
  const visibleSessions = useMemo(() => {
    if (activeTab === 'archived') return archivedSessions
    if (activeTab === 'cancelled') return sortedSessions.filter((session) => session.isCancelled)
    if (activeTab === 'past') return sortedSessions.filter((session) => !session.isCancelled && Date.parse(session.startTime) < Date.now())
    return sortedSessions.filter((session) => !session.isCancelled && Date.parse(session.startTime) >= Date.now())
  }, [activeTab, archivedSessions, sortedSessions])

  async function openDetails(sessionId: string) {
    setDetailSessionId(sessionId)
    setSessionDetails(null)
    setDetailsError(null)
    setManualBookingOpen(false)
    setManualBookingError(null)
    setManualBookingSuccess(null)
    setDetailsLoading(true)
    try { setSessionDetails(await getAdminCourseSessionDetails(sessionId)) }
    catch (requestError) { setDetailsError(errorText(requestError)) }
    finally { setDetailsLoading(false) }
  }

  async function cancelBooking(bookingId: string, customerName: string) {
    if (!detailSessionId || !window.confirm(`Avboka ${customerName}? Bokningshistoriken sparas.`)) return
    setDetailsError(null)
    setBusyId(bookingId)
    try { setSessionDetails(await cancelAdminBooking(detailSessionId, bookingId)); await loadSessions(true) }
    catch (requestError) { setDetailsError(errorText(requestError)) }
    finally { setBusyId(null) }
  }

  async function submitManualBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!detailSessionId) return
    setManualBookingError(null)
    setManualBookingSuccess(null)
    setBusyId('manual-booking')
    try {
      const details = await bookAdminStudent(detailSessionId, {
        firstName: manualBookingForm.firstName.trim(),
        lastName: manualBookingForm.lastName.trim(),
        phone: manualBookingForm.phone.trim(),
        email: manualBookingForm.email.trim(),
      })
      setSessionDetails(details)
      setManualBookingForm(emptyManualStudent)
      setManualBookingOpen(false)
      setManualBookingSuccess(`${manualBookingForm.firstName.trim()} ${manualBookingForm.lastName.trim()} har bokats in.`)
      await loadSessions(true)
    } catch (requestError) {
      setManualBookingError(errorText(requestError))
    } finally {
      setBusyId(null)
    }
  }

  async function cancelSession() {
    if (!detailSessionId || !sessionDetails) return
    const affectedCount = sessionDetails.activeBookingCount
    const extraWarning = affectedCount > 0
      ? ` ${affectedCount} aktiva bokningar kommer att avbokas.`
      : ' Inga aktiva bokningar påverkas.'
    if (!window.confirm(`Ställ in hela kurstillfället?${extraWarning} Du behöver kontakta berörda elever. Bokningshistoriken sparas.`)) return
    setDetailsError(null)
    setBusyId(detailSessionId)
    try { setSessionDetails(await cancelAdminCourseSession(detailSessionId)); await loadSessions(true) }
    catch (requestError) { setDetailsError(errorText(requestError)) }
    finally { setBusyId(null) }
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!createCourse || !createCourseId) return
    setActionError(null)
    setBusyId('create')
    try {
      await createAdminCourseSession({ courseId: createCourseId, startTime: fromLocalInput(createForm.startTime), endTime: fromLocalInput(createForm.endTime), capacity: Number(createForm.capacity) })
      setCreateCourse(null)
      setCreateCourseId('')
      setCreateForm(emptyForm)
      await loadSessions(true)
    } catch (submitError) { setActionError(errorText(submitError)) } finally { setBusyId(null) }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    setActionError(null)
    setBusyId(id)
    try {
      await updateAdminCourseSession(id, { startTime: fromLocalInput(editForm.startTime), endTime: fromLocalInput(editForm.endTime), capacity: Number(editForm.capacity) })
      setEditing(null)
      await loadSessions(true)
    } catch (submitError) { setActionError(errorText(submitError)) } finally { setBusyId(null) }
  }

  async function togglePublished(session: AdminCourseSession) {
    setActionError(null)
    setBusyId(session.id)
    try {
      await setAdminCourseSessionPublished(session.id, !session.isPublished)
      await loadSessions(true)
    } catch (requestError) { setActionError(errorText(requestError)) } finally { setBusyId(null) }
  }

  async function removeSession(session: AdminCourseSession) {
    if (!window.confirm(`Ta bort kurstillfället ${displayDateTime(session.startTime)}? Åtgärden går inte att ångra.`)) return
    setActionError(null)
    setBusyId(session.id)
    try {
      await deleteAdminCourseSession(session.id)
      await loadSessions(true)
    } catch (requestError) { setActionError(errorText(requestError)) } finally { setBusyId(null) }
  }

  async function archiveSession(session: AdminCourseSession) {
    const count = session.bookingHistoryCount
    if (!window.confirm(`Arkivera kurstillfället ${displayDateTime(session.startTime)}? ${count} bokningsposter och deltagaruppgifter behålls. Tillfället döljs från den vanliga listan och publik bokning.`)) return
    setActionError(null)
    setBusyId(session.id)
    try { await archiveAdminCourseSession(session.id); await loadSessions(true) }
    catch (requestError) { setActionError(errorText(requestError)) }
    finally { setBusyId(null) }
  }

  function startEdit(session: AdminCourseSession) {
    setEditing(session.id)
    setEditForm({ startTime: toLocalInput(session.startTime), endTime: toLocalInput(session.endTime), capacity: '16' })
  }

  return <section className="admin-page">
    <header className="admin-heading">
      <p className="admin-eyebrow">PERSONALPORTAL</p>
      <h1>Administration</h1>
      <p>Hantera kurstillfällen för Riskettan Bil och MC.</p>
      <button className="admin-refresh" type="button" onClick={() => void loadSessions(true)} disabled={refreshing || loading}>{refreshing ? 'Hämtar…' : 'Uppdatera lista'}</button>
    </header>
    {!isApiConfigured && <p className="admin-notice" role="alert">API-adressen är inte konfigurerad. Kontrollera VITE_DOTNET_API_BASE_URL.</p>}
    {error && <div className="admin-error admin-global-error" role="alert"><p>{error}</p><button type="button" onClick={() => void loadSessions(true)}>Försök igen</button></div>}
    {actionError && <p className="admin-error" role="alert">{actionError}</p>}

    <nav className="admin-session-tabs" aria-label="Filtrera kurstillfällen">
      <button type="button" aria-pressed={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')}>Kommande ({sessions.filter((session) => !session.isCancelled && Date.parse(session.startTime) >= Date.now()).length})</button>
      <button type="button" aria-pressed={activeTab === 'past'} onClick={() => setActiveTab('past')}>Tidigare ({sessions.filter((session) => !session.isCancelled && Date.parse(session.startTime) < Date.now()).length})</button>
      <button type="button" aria-pressed={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')}>Inställda ({sessions.filter((session) => session.isCancelled).length})</button>
      <button type="button" aria-pressed={activeTab === 'archived'} onClick={() => setActiveTab('archived')}>Arkiverade ({archivedSessions.length})</button>
    </nav>

    <div className="admin-course-grid">
      {(['car', 'mc'] as const).map((course) => {
        const apiCourseType = course === 'car' ? 'RiskettanBil' : 'RiskettanMC'
        const courseRecords = courses.filter((record) => record.type === apiCourseType)
        const activeCourseRecords = courseRecords.filter((record) => record.isActive)
        const courseIds = new Set(courseRecords.map((record) => record.id))
        const items = visibleSessions.filter((session) => courseIds.has(session.courseId))
        return <section className="admin-course" key={course} aria-labelledby={`admin-${course}-title`}>
          <div className="admin-course-heading"><div><p className="admin-eyebrow">KURSTYP</p><h2 id={`admin-${course}-title`}>{courseNames[course]}</h2></div><span className="admin-count">{items.length} kurstillfällen</span></div>
          {activeTab !== 'archived' && <button type="button" className="admin-action-button" disabled={activeCourseRecords.length === 0 || Boolean(busyId)} onClick={() => { setActionError(null); setCreateCourse(course); setCreateCourseId(activeCourseRecords.length === 1 ? activeCourseRecords[0].id : ''); setCreateForm(emptyForm) }}>Skapa kurstillfälle</button>}
          {!loading && activeCourseRecords.length === 0 && <p className="admin-state">Det finns ingen aktiv kurs av typen {courseNames[course]} i databasen. Be en administratör kontrollera kursregistret.</p>}
          {!loading && activeCourseRecords.length > 1 && <p className="admin-state">Flera aktiva kursposter finns. Välj rätt CourseId när du skapar ett tillfälle.</p>}
          {loading && <p className="admin-state" role="status">Hämtar kurstillfällen…</p>}
          {!loading && courseRecords.length > 0 && items.length === 0 && <p className="admin-state">Inga kurstillfällen hittades.</p>}
          {items.length > 0 && <ul className="admin-session-list">{items.map((session) => <li className="admin-session" key={session.id}>
            <div className="admin-session-main"><h3>{displayDateTime(session.startTime)}</h3><span className={`admin-status ${session.isPublished ? '' : 'admin-status-unpublished'}`}>{session.isArchived ? 'Arkiverat' : session.isPublished ? 'Publicerad' : 'Opublicerad'}</span></div>
            <p className="admin-session-times">Slutar {displayDateTime(session.endTime)}</p>
            <p className="admin-places">Fast kapacitet: {session.capacity} platser</p>
            {session.isCancelled && <span className="admin-status admin-status-cancelled">Inställt</span>}
            <p className="admin-places">Bokade elever: {session.activeBookingCount} av {session.capacity}</p>
            <p className="admin-places">Lediga platser: {session.availableSeats}</p>
            <div className="admin-session-actions">{!session.isArchived && <><button type="button" disabled={Boolean(busyId) || session.isCancelled} onClick={() => startEdit(session)}>Ändra</button><button type="button" disabled={Boolean(busyId) || session.isCancelled} onClick={() => void togglePublished(session)}>{session.isCancelled ? 'Inställt' : session.isPublished ? 'Avpublicera' : 'Publicera'}</button>{session.bookingHistoryCount > 0 ? <button type="button" className="admin-delete" disabled={Boolean(busyId)} onClick={() => void archiveSession(session)}>Arkivera</button> : <button type="button" className="admin-delete" disabled={Boolean(busyId)} onClick={() => void removeSession(session)}>Ta bort</button>}</>}</div>
            <div className="admin-session-actions"><button type="button" disabled={Boolean(busyId)} onClick={() => void openDetails(session.id)}>Visa deltagare</button></div>
            {editing === session.id && <form className="admin-inline-form" onSubmit={(event) => void submitEdit(event, session.id)}><h4>Ändra kurstillfälle</h4><SessionFields form={editForm} onChange={setEditForm} /><div className="admin-form-actions"><button type="submit" disabled={busyId === session.id}>{busyId === session.id ? 'Sparar…' : 'Spara ändringar'}</button><button type="button" onClick={() => setEditing(null)}>Avbryt</button></div></form>}
          </li>)}</ul>}
        </section>
      })}
    </div>
    {detailSessionId && <div className="admin-dialog-backdrop" role="presentation"><section className="admin-dialog admin-participants-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-participants-title"><div className="admin-dialog-heading"><h2 id="admin-participants-title">Deltagare</h2><button type="button" aria-label="Stäng" onClick={() => { setDetailSessionId(null); setSessionDetails(null); setDetailsError(null) }}>Stäng</button></div>
      {detailsLoading && <p className="admin-state" role="status">Hämtar deltagarlista…</p>}
      {detailsError && <p className="admin-error" role="alert">{detailsError}</p>}
      {sessionDetails && <>
        <div className="admin-booking-summary">
          <span><strong>{sessionDetails.capacity}</strong> max 16 platser</span>
          <span><strong>{sessionDetails.activeBookingCount}</strong> bokade</span>
          <span><strong>{sessionDetails.availableSeats}</strong> lediga platser</span>
          <span><strong>{sessionDetails.bookings.length}</strong> bokningsposter i historiken</span>
        </div>
        {manualBookingSuccess && <p className="admin-booking-success" role="status">{manualBookingSuccess}</p>}
        <p className="admin-booking-status-counts">
          Bekräftade: {sessionDetails.bookings.filter((booking) => booking.status === 'Confirmed').length}
          {' · '}Väntande: {sessionDetails.bookings.filter((booking) => booking.status === 'Pending' && booking.countsTowardCapacity).length}
          {' · '}Utgångna väntande: {sessionDetails.bookings.filter((booking) => booking.status === 'Pending' && !booking.countsTowardCapacity).length}
          {' · '}Avbokade: {sessionDetails.bookings.filter((booking) => booking.status === 'Cancelled').length}
        </p>
        {sessionDetails.isCancelled && <p className="admin-contact-warning" role="status">Kurstillfället är inställt. Personalen behöver kontakta berörda elever.</p>}
        {sessionDetails.isArchived && <p className="admin-contact-warning" role="status">Kurstillfället är arkiverat. Bokningshistorik och deltagaruppgifter är bevarade.</p>}
        {!sessionDetails.isCancelled && !sessionDetails.isArchived && <>
          <button type="button" className="admin-action-button" disabled={Boolean(busyId) || sessionDetails.availableSeats === 0} onClick={() => { setManualBookingError(null); setManualBookingSuccess(null); setManualBookingForm(emptyManualStudent); setManualBookingOpen(true) }}>Boka in elev</button>
          {sessionDetails.availableSeats === 0 && <p className="admin-state">Kurstillfället är fullt. Maxkapaciteten är 16 deltagare.</p>}
          {manualBookingError && <p className="admin-error" role="alert">{manualBookingError}</p>}
          {manualBookingOpen && <form className="admin-inline-form admin-manual-booking-form" onSubmit={(event) => void submitManualBooking(event)}>
            <h3>Boka in elev</h3>
            <div className="admin-form-grid">
              <label className="request-field"><span>Förnamn</span><input type="text" autoComplete="given-name" required maxLength={100} value={manualBookingForm.firstName} onChange={(event) => setManualBookingForm({ ...manualBookingForm, firstName: event.target.value })} /></label>
              <label className="request-field"><span>Efternamn</span><input type="text" autoComplete="family-name" required maxLength={100} value={manualBookingForm.lastName} onChange={(event) => setManualBookingForm({ ...manualBookingForm, lastName: event.target.value })} /></label>
              <label className="request-field"><span>Telefonnummer</span><input type="tel" autoComplete="tel" required maxLength={50} value={manualBookingForm.phone} onChange={(event) => setManualBookingForm({ ...manualBookingForm, phone: event.target.value })} /></label>
              <label className="request-field"><span>E-postadress</span><input type="email" autoComplete="email" required maxLength={200} value={manualBookingForm.email} onChange={(event) => setManualBookingForm({ ...manualBookingForm, email: event.target.value })} /></label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" disabled={busyId === 'manual-booking' || sessionDetails.availableSeats === 0}>{busyId === 'manual-booking' ? 'Bokar…' : 'Boka in elev'}</button>
              <button type="button" disabled={busyId === 'manual-booking'} onClick={() => { setManualBookingOpen(false); setManualBookingError(null) }}>Avbryt</button>
            </div>
          </form>}
        </>}
        {!sessionDetails.isCancelled && !sessionDetails.isArchived && <button type="button" className="admin-cancel-session" disabled={Boolean(busyId)} onClick={() => void cancelSession()}>Ställ in hela kurstillfället</button>}
        {sessionDetails.bookings.length === 0 && <p className="admin-state">Inga bokningar för kurstillfället.</p>}
        {sessionDetails.bookings.length > 0 && <ul className="admin-booking-list">{sessionDetails.bookings.map((booking) => <li key={booking.id} className={booking.status === 'Cancelled' ? 'admin-booking-cancelled' : ''}>
          <div><h3>{booking.firstName && booking.lastName ? `${booking.firstName} ${booking.lastName}` : booking.customerName}</h3><p>{booking.email}</p><p>{booking.phone}</p><p>Bokad {dateFormatter.format(new Date(booking.createdAt))}</p></div>
          <div className="admin-booking-status"><span>{booking.status === 'Confirmed' ? 'Bekräftad' : booking.status === 'Cancelled' ? 'Avbokad' : booking.countsTowardCapacity ? 'Väntande' : 'Väntande · reservationen har löpt ut'}</span>{booking.status !== 'Cancelled' && !sessionDetails.isCancelled && !sessionDetails.isArchived && <button type="button" disabled={Boolean(busyId)} onClick={() => void cancelBooking(booking.id, booking.customerName)}>{busyId === booking.id ? 'Avbokar…' : 'Avboka elev'}</button>}</div>
        </li>)}</ul>}
      </>}
    </section></div>}
    {createCourse && <div className="admin-dialog-backdrop" role="presentation"><section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-create-title"><h2 id="admin-create-title">Skapa {courseNames[createCourse]}</h2><form onSubmit={(event) => void submitCreate(event)}><label className="request-field admin-course-select"><span>Kurs och CourseId</span><select required value={createCourseId} onChange={(event) => setCreateCourseId(event.target.value)}><option value="">Välj kurs</option>{courses.filter((record) => record.type === (createCourse === 'car' ? 'RiskettanBil' : 'RiskettanMC') && record.isActive).map((record) => <option key={record.id} value={record.id}>{record.title} · ID …{record.id.slice(-8)}</option>)}</select></label><SessionFields form={createForm} onChange={setCreateForm} /><div className="admin-form-actions"><button type="submit" disabled={busyId === 'create' || !createCourseId}>{busyId === 'create' ? 'Skapar…' : 'Skapa kurstillfälle'}</button><button type="button" onClick={() => setCreateCourse(null)}>Avbryt</button></div></form></section></div>}
  </section>
}
