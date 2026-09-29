import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { BookingLink } from './BookingLink'
import { useAuth } from '../auth/AuthContext'

export function SiteHeader() {
  const { pathname } = useLocation()
  return <SiteHeaderContent key={pathname} pathname={pathname} />
}

function SiteHeaderContent({ pathname }: { pathname: string }) {
  const { user, signOut } = useAuth()
  const [openMenu, setOpenMenu] = useState<'education' | 'prices' | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<'car' | 'mc' | null>(null)
  const isHome = pathname === '/'
  const navigationRef = useRef<HTMLElement>(null)
  const educationButtonRef = useRef<HTMLButtonElement>(null)
  const pricesButtonRef = useRef<HTMLButtonElement>(null)
  const hoverOpenedMenu = useRef<'education' | 'prices' | null>(null)

  function closeMenus() {
    hoverOpenedMenu.current = null
    setOpenMenu(null)
    setOpenSubmenu(null)
  }

  function toggleMenu(menu: 'education' | 'prices') {
    const wasOpenedByHover = hoverOpenedMenu.current === menu
    hoverOpenedMenu.current = null
    setOpenMenu((currentMenu) => currentMenu === menu && !wasOpenedByHover ? null : menu)
    setOpenSubmenu(null)
  }

  function openOnHover(menu: 'education' | 'prices') {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hoverOpenedMenu.current = menu
      setOpenMenu(menu)
      setOpenSubmenu(null)
    }
  }

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      if (!navigationRef.current?.contains(event.target as Node)) closeMenus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !openMenu) return
      const trigger = openMenu === 'education' ? educationButtonRef.current : pricesButtonRef.current
      closeMenus()
      trigger?.focus()
    }

    document.addEventListener('pointerdown', handleOutsidePointer)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  return (
    <header className={`site-header${isHome ? ' site-header-home' : ''}`}>
      <Link className="brand" to="/" aria-label="Nyhems Trafikskola startsida">
        <img
          src={isHome ? '/images/nyhems-logo-white.png' : '/images/nyhems-logo.png'}
          alt="Nyhems Trafikskola"
        />
      </Link>
      <nav
        id="site-navigation"
        aria-label="Huvudmeny"
        ref={navigationRef}
        className="main-nav"
      >
        <div
          className={`nav-dropdown${openMenu === 'education' ? ' nav-dropdown-open' : ''}`}
          onMouseEnter={() => openOnHover('education')}
          onMouseLeave={closeMenus}
        >
          <button
            ref={educationButtonRef}
            className="nav-dropdown-trigger"
            type="button"
            aria-expanded={openMenu === 'education'}
            aria-controls="education-menu"
            onClick={() => toggleMenu('education')}
          >
            Utbildningar <span aria-hidden="true">⌄</span>
          </button>
          <div id="education-menu" className="nav-dropdown-menu nav-course-menu" hidden={openMenu !== 'education'}>
            <div className="nav-link-group">
              <div className="nav-group-head">
                <Link onClick={closeMenus} to="/bil-korkort">Bil körkort</Link>
                <button className="nav-submenu-toggle" type="button" aria-label="Visa undersidor för Bil körkort" aria-expanded={openSubmenu === 'car'} aria-controls="car-submenu" onClick={() => setOpenSubmenu((current) => current === 'car' ? null : 'car')}>⌄</button>
              </div>
              <div className="nav-submenu" id="car-submenu" hidden={openSubmenu !== 'car'}>
                <Link onClick={closeMenus} to="/riskettan-bil">Riskettan bil</Link>
                <Link onClick={closeMenus} to="/risktvaan-bil">Risktvåan bil</Link>
              </div>
            </div>
            <div className="nav-link-group">
              <div className="nav-group-head">
                <Link onClick={closeMenus} to="/mc-korkort">MC körkort</Link>
                <button className="nav-submenu-toggle" type="button" aria-label="Visa undersidor för MC körkort" aria-expanded={openSubmenu === 'mc'} aria-controls="mc-submenu" onClick={() => setOpenSubmenu((current) => current === 'mc' ? null : 'mc')}>⌄</button>
              </div>
              <div className="nav-submenu" id="mc-submenu" hidden={openSubmenu !== 'mc'}>
                <Link onClick={closeMenus} to="/riskettan-mc">Riskettan MC</Link>
                <Link onClick={closeMenus} to="/risktvaan-mc">Risktvåan MC</Link>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`nav-dropdown${openMenu === 'prices' ? ' nav-dropdown-open' : ''}`}
          onMouseEnter={() => openOnHover('prices')}
          onMouseLeave={closeMenus}
        >
          <button
            ref={pricesButtonRef}
            className="nav-dropdown-trigger"
            type="button"
            aria-expanded={openMenu === 'prices'}
            aria-controls="prices-menu"
            onClick={() => toggleMenu('prices')}
          >
            Priser och paket <span aria-hidden="true">⌄</span>
          </button>
          <div id="prices-menu" className="nav-dropdown-menu" hidden={openMenu !== 'prices'}>
            <Link onClick={closeMenus} to="/bil-priser-och-paket">Bil – priser och paket</Link>
            <Link onClick={closeMenus} to="/mc-priser-och-paket">MC – priser och paket</Link>
          </div>
        </div>
        <Link onClick={closeMenus} to="/om-oss">Om oss</Link>
        <Link onClick={closeMenus} to="/kontakt">Kontakt</Link>
      </nav>
      {user ? (
        <div className="header-account">
          <Link to="/admin">Administration</Link>
          <button type="button" onClick={() => void signOut().catch(() => {})}>Logga ut</button>
        </div>
      ) : <BookingLink>Boka en körlektion</BookingLink>}
    </header>
  )
}
