import { apiRequest } from './client'

export type PublicCourseSession = {
  courseSessionId: string
  courseType: 'RiskettanBil' | 'RiskettanMC'
  courseTitle: string
  startTime: string
  endTime: string
  price: number
  totalSeats: number
  availableSeats: number
}

export type StudentBookingResult = {
  bookingId: string
  courseSessionId: string
  status: 'Confirmed'
  availableSeats: number
}

export function getPublicCourseSessions(courseType: 'RiskettanBil' | 'RiskettanMC') {
  return apiRequest<PublicCourseSession[]>(`/api/course-sessions?courseType=${courseType}`)
}

// Version of the terms shown in RiskettanBookingForm. Must match BookingTerms.CurrentVersion in the backend;
// change both together with the terms text, otherwise bookings are rejected as using outdated terms.
export const BOOKING_TERMS_VERSION = '2026-10-14'

// The student is identified by the signed-in account; only the session and the terms acceptance are sent.
export async function bookCourseSession(courseSessionId: string) {
  const result = await apiRequest<StudentBookingResult>(`/api/course-sessions/${encodeURIComponent(courseSessionId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify({ termsAccepted: true, termsVersion: BOOKING_TERMS_VERSION }),
  })

  if (result?.status !== 'Confirmed' || typeof result.bookingId !== 'string') {
    throw new Error('Bokningen kunde inte bekräftas av bokningssystemet.')
  }

  return result
}
