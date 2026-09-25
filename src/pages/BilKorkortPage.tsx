import { InformationPage } from '../components/InformationPage'
import { Link } from 'react-router'
import { Button } from '../components/Button'

export function BilKorkortPage() {
  return (
    <>
      <InformationPage
        title="Ta körkort hos oss"
        description="Oavsett om du är nybörjare eller redan har börjat övningsköra hjälper vi dig vidare i din utbildning."
        image="/images/bild1.jpeg"
        imageAlt="Vy från förarplatsen under en körlektion"
        actions={(
          <div className="information-page-actions">
            <Button to="/forfragan-testlektion">Boka testlektion</Button>
            <Button to="/bokning-riskettan-bil" variant="secondary">Boka Riskettan bil</Button>
          </div>
        )}
      />
      <section className="bil-course-sections">
        <article className="bil-course-section bil-test-lesson">
          <div>
            <h2>Testlektion</h2>
            <p>Boka en testlektion så går vi igenom din körning och planerar utbildningen utifrån din nivå.</p>
          </div>
          <Button to="/forfragan-testlektion">Boka testlektion</Button>
        </article>

        <div className="bil-risk-sections">
          <article className="bil-course-section">
            <h2>Riskettan bil</h2>
            <p>Riskettan är en del av riskutbildningen för B-körkort. Kontakta oss för information om upplägg och bokning.</p>
            <div className="bil-course-actions">
              <Button to="/bokning-riskettan-bil">Boka Riskettan bil</Button>
              <Link className="text-link" to="/riskettan-bil">Läs mer om Riskettan <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
          <article className="bil-course-section">
            <h2>Risktvåan bil</h2>
            <p>Risktvåan genomförs på halkbana.</p>
            <p className="risk-booking-note">För att boka Risktvåan genom oss behöver du först genomföra en testlektion. Då får vi möjlighet att bedöma din körnivå och hjälpa dig vidare med rätt planering.</p>
            <div className="bil-course-actions">
              <Button to="/forfragan-testlektion">Boka testlektion</Button>
              <Link className="text-link" to="/risktvaan-bil">Läs mer om Risktvåan <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        </div>
      </section>

      <section className="bil-prices-cta">
        <h2>Priser och paket</h2>
        <Button to="/bil-priser-och-paket" variant="secondary">Se priser och paket <span aria-hidden="true">↗</span></Button>
      </section>
    </>
  )
}
