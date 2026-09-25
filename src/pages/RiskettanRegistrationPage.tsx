import { RiskettanBookingForm } from '../components/RiskettanBookingForm'
import { carRiskettanPrice } from '../data/prices'

export function RiskettanRegistrationPage() {
  return <RiskettanBookingForm course="car" price={carRiskettanPrice} />
}
