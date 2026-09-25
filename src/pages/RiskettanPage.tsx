import { InformationPage } from '../components/InformationPage'
import { Button } from '../components/Button'
import { mcRiskettanPrice } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

export function RiskettanBilPage() {
  return (
    <InformationPage
      title="Riskettan bil"
      description="Riskettan är en del av riskutbildningen för B-körkort. Kontakta oss för aktuell information om utbildningen."
      actions={<Button to="/bokning-riskettan-bil">Boka Riskettan bil</Button>}
    />
  )
}

export function RiskettanMcPage() {
  return (
    <>
      <InformationPage
        title="Riskettan MC"
        description="Riskettan är den teoretiska delen av den obligatoriska riskutbildningen för motorcykelkörkort."
        image="/images/IMG_1220.jpeg"
        imageAlt="MC-elev på motorcykel under utbildning hos Nyhems Trafikskola"
      />

      <section className="mc-risk-info" aria-label="Information om Riskettan MC">
        <div className="mc-risk-info-grid">
          <article className="mc-course-card" aria-labelledby="mc-risk-what">
            <h2 id="mc-risk-what">Vad är Riskettan MC?</h2>
            <p>Kursen tar upp risker vid motorcykelkörning och hur beteenden och beslut påverkar säkerheten. Du får också prata om hur riskfyllda situationer kan förebyggas.</p>
          </article>

          <article className="mc-course-card" aria-labelledby="mc-risk-content">
            <h2 id="mc-risk-content">Vad går vi igenom?</h2>
            <ul className="mc-risk-topic-list">
              <li>Riskmedvetenhet och riskfyllda beteenden</li>
              <li>Alkohol, droger och trötthet</li>
              <li>Hastighet och säkerhetsmarginaler</li>
              <li>Motorcyklistens utsatthet i trafiken</li>
            </ul>
          </article>

          <article className="mc-course-card" aria-labelledby="mc-risk-who">
            <h2 id="mc-risk-who">Vem behöver gå kursen?</h2>
            <p>Riskettan MC ingår i riskutbildningen för MC-körkort. Den här kursen gäller motorcykel och är separat från Riskettan för bil.</p>
          </article>

          <article className="mc-risk-apply" aria-labelledby="mc-risk-apply-heading">
            <div>
              <h2 id="mc-risk-apply-heading">Pris och anmälan</h2>
              <p className="mc-course-price">{priceFormatter.format(mcRiskettanPrice)} kr</p>
            </div>
            <Button to="/bokning-riskettan-mc">Boka Riskettan MC</Button>
          </article>
        </div>
      </section>
    </>
  )
}
