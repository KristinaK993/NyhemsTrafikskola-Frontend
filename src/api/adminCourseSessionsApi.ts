import { apiRequest } from './client'

export type AdminCourseSession = {
  id: string
  courseId: string
  startTime: string
  endTime: string
  capacity: number
  isPublished: boolean
  isCancelled: boolean
  isArchived: boolean
  activeBookingCount: number
  availableSeats: number
  bookingHistoryCount: number
}

export type AdminBooking = {
  id: string
  customerName: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string
  createdAt: string
  status: 'Pending' | 'Confirmed' | 'Cancelled'
  countsTowardCapacity: boolean
  bookedOnline: boolean
  bookedByName: string | null
  termsAcceptedAt: string | null
  termsVersion: string | null
  cancelledAt: string | null
  cancellationReason: 'StudentOnline' | 'Staff' | 'SessionCancelled' | null
  cancelledByName: string | null
  isLateCancellation: boolean
}

export type AdminCourseSessionDetails = {
  courseSessionId: string
  capacity: number
  activeBookingCount: number
  availableSeats: number
  isCancelled: boolean
  isArchived: boolean
  bookings: AdminBooking[]
}

export type ManualBookingInput = {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export type AdminCourse = {
  id: string
  type: 'RiskettanBil' | 'RiskettanMC'
  title: string
  price: number
  isActive: boolean
}

export type CourseSessionInput = {
  courseId: string
  startTime: string
  endTime: string
  capacity: number
  isPublished?: boolean
}

export function getAdminCourseSessions(archived = false) {
  return apiRequest<AdminCourseSession[]>(`/api/admin/course-sessions?archived=${archived}`)
}

export function getAdminCourseSessionDetails(id: string) {
  return apiRequest<AdminCourseSessionDetails>(`/api/admin/course-sessions/${id}`)
}

export function bookAdminStudent(sessionId: string, student: ManualBookingInput) {
  return apiRequest<AdminCourseSessionDetails>(`/api/admin/course-sessions/${sessionId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(student),
  })
}

export function cancelAdminBooking(sessionId: string, bookingId: string) {
  return apiRequest<AdminCourseSessionDetails>(`/api/admin/course-sessions/${sessionId}/bookings/${bookingId}/cancel`, { method: 'POST' })
}

export function cancelAdminCourseSession(sessionId: string) {
  return apiRequest<AdminCourseSessionDetails>(`/api/admin/course-sessions/${sessionId}/cancel`, { method: 'POST' })
}

export function archiveAdminCourseSession(sessionId: string) {
  return apiRequest<void>(`/api/admin/course-sessions/${sessionId}/archive`, { method: 'POST' })
}

export function getAdminCourses() {
  return apiRequest<AdminCourse[]>('/api/admin/courses')
}

export function createAdminCourseSession(session: CourseSessionInput) {
  return apiRequest<AdminCourseSession>('/api/admin/course-sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  })
}

export function updateAdminCourseSession(id: string, session: Omit<CourseSessionInput, 'courseId' | 'isPublished'>) {
  return apiRequest<AdminCourseSession>(`/api/admin/course-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(session),
  })
}

export function setAdminCourseSessionPublished(id: string, published: boolean) {
  return apiRequest<void>(`/api/admin/course-sessions/${id}/${published ? 'publish' : 'unpublish'}`, { method: 'POST' })
}

export function deleteAdminCourseSession(id: string) {
  return apiRequest<void>(`/api/admin/course-sessions/${id}`, { method: 'DELETE' })
}
