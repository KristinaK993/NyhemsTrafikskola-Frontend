import { apiRequest } from './client'

export type OnlineCancellation = 'Allowed' | 'DeadlinePassed' | 'ContactSchool'

export type StudentBooking = {
  bookingId: string
  courseSessionId: string
  courseType: 'RiskettanBil' | 'RiskettanMC'
  courseTitle: string
  price: number
  startTime: string
  endTime: string
  status: 'Confirmed'
  bookedAt: string
  onlineCancellationDeadline: string
  onlineCancellation: OnlineCancellation
}

// Returns the signed-in student's upcoming confirmed bookings; the API identifies the student from the session cookie.
export function getMyUpcomingBookings() {
  return apiRequest<StudentBooking[]>('/api/student/bookings')
}

export function cancelMyBooking(bookingId: string) {
  return apiRequest<{ bookingId: string; status: 'Cancelled' }>(`/api/student/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
  })
}
