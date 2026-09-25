import { InformationPage } from '../components/InformationPage'
import { Button } from '../components/Button'
import { mcRisktvaanPrice } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

export function RisktvaanBilPage() {
  return (
    <>
      <InformationPage
        title="Risktvåan bil"
        description="Risktvåan är en del av riskutbildningen för B-körkort. Kontakta oss för aktuell information om utbildningen."
        actionLabel="Kontakta oss"
      />
      <div className="course-pricing-link">
        <Button to="/forfragan-testlektion">Boka testlektion</Button>
      </div>
    </>
  )
}

export function RisktvaanMcPage() {
  return (
    <InformationPage
      title="Risktvåan MC"
      description="Risktvåan MC är den praktiska delen av riskutbildningen för motorcykel. Kontakta oss så hjälper vi dig att planera nästa steg."
      image="/images/bild3.jpeg"
      imageAlt="MC-elev på motorcykel under övning"
      details={`Pris: ${priceFormatter.format(mcRisktvaanPrice)} kr`}
      actions={<Button to="/forfragan-risktvaan-mc">Skicka förfrågan om Risktvåan MC</Button>}
    />
  )
}
