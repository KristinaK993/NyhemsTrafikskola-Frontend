import { Navigate } from 'react-router'

// Bookings are made from the student session list; this route only remains for existing links.
export function RiskettanRegistrationPage() {
  return <Navigate to="/riskettan-bil" replace />
}
