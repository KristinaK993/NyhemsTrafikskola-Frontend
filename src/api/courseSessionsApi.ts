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

// The student is identified by the signed-in account; only the session and the terms acceptance are sent.
export async function bookCourseSession(courseSessionId: string) {
  const result = await apiRequest<StudentBookingResult>(`/api/course-sessions/${encodeURIComponent(courseSessionId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify({ termsAccepted: true }),
  })

  if (result?.status !== 'Confirmed' || typeof result.bookingId !== 'string') {
    throw new Error('Bokningen kunde inte bekräftas av bokningssystemet.')
  }

  return result
}
