import { InformationPage } from '../components/InformationPage'
import { McPackageCards } from '../components/McPackageCards'
import { ServicePriceList } from '../components/ServicePriceList'
import { mcServices } from '../data/prices'

export function McPricesPage() {
  return (
    <>
      <InformationPage
        title="MC – priser och paket"
        description="Här hittar du våra MC-paket och priser för enskilda tjänster."
        image="/images/bild3.jpeg"
        imageAlt="MC-elev på motorcykel under utbildning hos Nyhems Trafikskola"
      />
      <section className="price-content-section" aria-labelledby="mc-paketpriser">
        <div className="mc-packages-heading"><h2 id="mc-paketpriser">MC-paket</h2></div>
        <McPackageCards />
      </section>
      <section className="price-content-section car-services-section" aria-labelledby="mc-prislista">
        <div className="mc-packages-heading"><h2 id="mc-prislista">Prislista för enskilda tjänster</h2></div>
        <ServicePriceList services={mcServices} />
      </section>
    </>
  )
}
