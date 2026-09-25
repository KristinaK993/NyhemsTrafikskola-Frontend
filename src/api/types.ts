export type RiskettanCourse = 'car' | 'mc'

export type PublishedRiskettanSession = {
  id: string
  course: RiskettanCourse
  startsAt: string
  label: string
  availablePlaces: number
}

export type ContactDetails = {
  fullName: string
  phone: string
  email: string
  message: string
}

export type TestLessonRequest = ContactDetails & {
  experience: '' | 'beginner' | 'private-practice' | 'previous-lessons'
  preferredTimes: string
}

export type McTrainingInquiry = ContactDetails & {
  licence: McLicence
  experience: string
  preferredTimes: string
}

export type RiskettanBooking = ContactDetails & {
  course: RiskettanCourse
  sessionId: string
}

export type McLicence = '' | 'A1' | 'A2' | 'A' | 'unsure'

export type RisktvaanMcInquiry = ContactDetails & {
  licence: McLicence
  experience: string
  preferredTimes: string
}

export type RequestAcceptedResponse = {
  requestId: string
  status: 'received'
}

export type BookingResponse = {
  bookingId: string
  status: 'confirmed' | 'pending'
}
