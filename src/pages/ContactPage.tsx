import { BookingLink } from '../components/BookingLink'

export function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-page-intro">
        <h1>Kontakta oss</h1>
        <p>Här hittar du våra kontaktuppgifter. Vi välkomnar både dig som vill börja och dig som vill fortsätta din utbildning.</p>
      </div>
      <div className="contact-placeholders">
        <div><h2>Telefon</h2><p>[Telefonnummer läggs till]</p></div>
        <div><h2>E-post</h2><p>[E-postadress läggs till]</p></div>
        <div><h2>Besöksadress</h2><p>[Adress läggs till]</p></div>
      </div>
      <div className="contact-booking" id="bokning">
        <p>Skicka en förfrågan om testlektion så kontaktar vi dig för att planera nästa steg.</p>
        <BookingLink>Boka en körlektion <span aria-hidden="true">↗</span></BookingLink>
      </div>
    </section>
  )
}
