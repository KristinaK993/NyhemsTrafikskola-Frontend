import { apiRequest } from './client'
import type {
  BookingResponse,
  McTrainingInquiry,
  PublishedRiskettanSession,
  RequestAcceptedResponse,
  RiskettanBooking,
  RiskettanCourse,
  RisktvaanMcInquiry,
  TestLessonRequest,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requireAcceptedResponse(value: unknown): RequestAcceptedResponse {
  if (!isRecord(value) || value.status !== 'received' || typeof value.requestId !== 'string') {
    throw new Error('Mottagaren kunde inte bekräfta att förfrågan togs emot.')
  }
  return value as RequestAcceptedResponse
}

function requireBookingResponse(value: unknown): BookingResponse {
  if (
    !isRecord(value)
    || typeof value.bookingId !== 'string'
    || (value.status !== 'confirmed' && value.status !== 'pending')
  ) {
    throw new Error('Bokningen kunde inte bekräftas av bokningssystemet.')
  }
  return value as BookingResponse
}

export async function getPublishedRiskettanSessions(course: RiskettanCourse) {
  const sessions = await apiRequest<unknown>(`/api/riskettan/${course}/sessions`)
  if (!Array.isArray(sessions)) throw new Error('Bokningssystemet returnerade inga giltiga kurstillfällen.')

  return sessions.filter((session): session is PublishedRiskettanSession => (
    isRecord(session)
    && session.course === course
    && typeof session.id === 'string'
    && typeof session.label === 'string'
    && typeof session.startsAt === 'string'
    && !Number.isNaN(Date.parse(session.startsAt))
    && Number.isInteger(session.availablePlaces)
    && (session.availablePlaces as number) > 0
  ))
}

export async function createTestLessonRequest(request: TestLessonRequest) {
  const response = await apiRequest<unknown>('/api/requests/test-lessons', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  return requireAcceptedResponse(response)
}

export async function createMcTrainingInquiry(inquiry: McTrainingInquiry) {
  const response = await apiRequest<unknown>('/api/requests/mc-training', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  })
  return requireAcceptedResponse(response)
}

export async function bookRiskettanCourse(booking: RiskettanBooking) {
  const { course, ...bookingDetails } = booking
  const response = await apiRequest<unknown>(`/api/bookings/riskettan/${course}`, {
    method: 'POST',
    body: JSON.stringify(bookingDetails),
  })
  return requireBookingResponse(response)
}

export async function createRisktvaanMcInquiry(inquiry: RisktvaanMcInquiry) {
  const response = await apiRequest<unknown>('/api/requests/risktvaan-mc', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  })
  return requireAcceptedResponse(response)
}
