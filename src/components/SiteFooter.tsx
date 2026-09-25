import { Link } from 'react-router'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" to="/" aria-label="Nyhems Trafikskola startsida">
        <img src="/images/nyhems-logo.png" alt="Nyhems Trafikskola" />
      </Link>
      <nav aria-label="Sidfot">
        <Link to="/bil-korkort">Bil körkort</Link>
        <Link to="/mc-korkort">MC körkort</Link>
        <Link to="/riskettan-bil">Riskettan bil</Link>
        <Link to="/risktvaan-bil">Risktvåan bil</Link>
        <Link to="/riskettan-mc">Riskettan MC</Link>
        <Link to="/risktvaan-mc">Risktvåan MC</Link>
        <Link to="/bil-priser-och-paket">Bil – priser och paket</Link>
        <Link to="/mc-priser-och-paket">MC – priser och paket</Link>
        <Link to="/om-oss">Om oss</Link>
        <Link to="/kontakt">Kontakt</Link>
      </nav>
    </footer>
  )
}
