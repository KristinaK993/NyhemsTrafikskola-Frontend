import { RiskettanBookingForm } from '../components/RiskettanBookingForm'
import { mcRiskettanPrice } from '../data/prices'

export function McRiskettanBookingPage() {
  return <RiskettanBookingForm course="mc" price={mcRiskettanPrice} />
}
