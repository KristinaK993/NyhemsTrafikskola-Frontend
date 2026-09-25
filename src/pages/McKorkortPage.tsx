import { InformationPage } from '../components/InformationPage'
import { Button } from '../components/Button'
import { mcRiskettanPrice, mcRisktvaanPrice } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

export function McKorkortPage() {
  return (
    <>
      <InformationPage
        title="Ta MC-körkort hos oss"
        description="Vi hjälper dig med din MC-utbildning, oavsett om du är nybörjare eller redan har börjat övningsköra."
        image="/images/IMG_1220.jpeg"
        imageAlt="Elev på motorcykel under MC-utbildning hos Nyhems Trafikskola"
        actions={(
          <div className="information-page-actions">
            <Button to="/forfragan-mc-utbildning">Skicka förfrågan</Button>
            <Button to="/mc-priser-och-paket" variant="secondary">Se MC-priser och paket</Button>
          </div>
        )}
      />

      <section className="mc-course-sections" aria-label="Information om MC-utbildningen">
        <article className="mc-course-intro">
          <div>
            <h2>Börja din MC-utbildning</h2>
            <p>Kontakta oss så pratar vi om din tidigare erfarenhet och planerar ett upplägg som passar dig.</p>
          </div>
          <Button to="/forfragan-mc-utbildning">Skicka förfrågan</Button>
        </article>

        <div className="mc-risk-sections">
          <article className="mc-course-card">
            <h2>Riskettan MC</h2>
            <p>Utbildningen tar upp risker i trafiken med koppling till motorcykelkörning.</p>
            <p className="mc-course-price">{priceFormatter.format(mcRiskettanPrice)} kr</p>
            <div className="mc-course-actions">
              <Button to="/riskettan-mc" variant="secondary">Läs mer om Riskettan MC</Button>
              <Button to="/bokning-riskettan-mc">Boka Riskettan MC</Button>
            </div>
          </article>

          <article className="mc-course-card">
            <h2>Risktvåan MC</h2>
            <p>Den praktiska delen av riskutbildningen för motorcykel.</p>
            <p className="mc-course-price">{priceFormatter.format(mcRisktvaanPrice)} kr</p>
            <div className="mc-course-actions">
              <Button to="/risktvaan-mc" variant="secondary">Läs mer om Risktvåan MC</Button>
              <Button to="/forfragan-risktvaan-mc">Skicka förfrågan</Button>
            </div>
          </article>
        </div>
      </section>

      <section className="mc-prices-cta">
        <div>
          <h2>MC-priser och paket</h2>
          <p>Se aktuella priser för enskilda tjänster och våra MC-paket.</p>
        </div>
        <Button to="/mc-priser-och-paket" variant="secondary">Se MC-priser och paket</Button>
      </section>
    </>
  )
}
