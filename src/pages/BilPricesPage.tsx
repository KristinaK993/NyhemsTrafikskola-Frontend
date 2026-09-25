import { InformationPage } from '../components/InformationPage'
import { PackageCards } from '../components/PackageCards'
import { ServicePriceList } from '../components/ServicePriceList'
import { carPackageRows, carPackages, carServices } from '../data/prices'

export function BilPricesPage() {
  return (
    <>
      <InformationPage
        title="Bil – priser och paket"
        description="Här hittar du våra körkortspaket och priser för enskilda tjänster."
        image="/images/bild2.jpeg"
        imageAlt="Nyhems Trafikskolas bil med skolans logotyp"
      />
      <section className="price-content-section" aria-labelledby="bil-paket">
        <div className="mc-packages-heading"><h2 id="bil-paket">Körkortspaket</h2></div>
        <PackageCards packages={carPackages} rows={carPackageRows} columns={3} />
      </section>
      <section className="price-content-section car-services-section" aria-labelledby="bil-prislista">
        <div className="mc-packages-heading"><h2 id="bil-prislista">Prislista för enskilda tjänster</h2></div>
        <ServicePriceList services={carServices} note="Studiematerial säljs av STR – Sveriges Trafikutbildares Riksförbund." />
      </section>
    </>
  )
}
