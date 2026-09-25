import { Link } from 'react-router'
import { BookingLink } from '../components/BookingLink'
import { Button } from '../components/Button'
import { carPackages } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

const courses = [
  { title: 'Bil körkort', text: 'Körlektioner utifrån din nivå och dina mål.', to: '/bil-korkort' },
  { title: 'MC körkort', text: 'Utbildning för dig som vill ta MC-körkort.', to: '/mc-korkort' },
  { title: 'Riskettan bil', text: 'Riskutbildning för B-körkort.', to: '/riskettan-bil' },
  { title: 'Risktvåan bil', text: 'Riskutbildning för B-körkort.', to: '/risktvaan-bil' },
  { title: 'Riskettan MC', text: 'Riskutbildning för MC-körkort.', to: '/riskettan-mc' },
  { title: 'Risktvåan MC', text: 'Riskutbildning för MC-körkort.', to: '/risktvaan-mc' },
]

export function HomePage() {
  return (
    <>
      <section className="hero" id="start">
        <img className="hero-photo" src="/images/nyhems-hero.png" alt="Nyhems Trafikskolas bilar parkerade vid trafikskolan" />
        <div className="hero-copy">
          <h1>Dags att ta körkort?</h1>
          <p>Vi hjälper dig hela vägen – oavsett om du ska börja från grunden eller redan har kommit en bit i din utbildning.</p>
          <BookingLink>Boka utbildning <span aria-hidden="true">↗</span></BookingLink>
        </div>
      </section>

      <section className="section courses" id="utbildningar">
        <div className="section-heading">
          <h2>Våra utbildningar</h2>
          <p>Vi erbjuder utbildning för dig som ska ta körkort eller vill fortsätta där du är.</p>
        </div>
        <div className="course-layout">
          <div className="course-list">
            {courses.map((course) => (
              <Link className="course-card" key={course.title} to={course.to}>
                <h3>{course.title}</h3>
                <p>{course.text}</p>
              </Link>
            ))}
          </div>
          <img src="/images/bild6.jpeg" alt="Elev framför Nyhems Trafikskolas vita bil med logotyp" />
        </div>
      </section>

      <section className="package-section" id="paket">
        <div>
          <h2>Körkortspaket</h2>
          <p>Bilpaket från {priceFormatter.format(carPackages[0].price)} kr</p>
        </div>
        <Button to="/bil-priser-och-paket" variant="secondary">Se priser och paket <span aria-hidden="true">↗</span></Button>
      </section>

      <section className="about" id="om-oss">
        <img className="about-photo" src="/images/bild2.jpeg" alt="Nyhems Trafikskolas vita bil med skolans logotyp" />
        <div className="about-content">
          <h2>Om oss</h2>
          <p>Med 40 års erfarenhet erbjuder vi personlig utbildning med fokus på dina mål och förutsättningar.</p>
          <Link className="text-link" to="/om-oss">Läs mer om oss <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="contact" id="kontakt">
        <div>
          <h2>Kontakta oss</h2>
          <p>Vill du börja din utbildning eller fortsätta där du slutade? Vi hjälper dig att hitta nästa steg.</p>
        </div>
        <Button to="/kontakt">Kontaktuppgifter <span aria-hidden="true">↗</span></Button>
      </section>
    </>
  )
}
