import { Navigate } from 'react-router'

// Bookings are made from the student session list; this route only remains for existing links.
export function McRiskettanBookingPage() {
  return <Navigate to="/riskettan-mc" replace />
}
