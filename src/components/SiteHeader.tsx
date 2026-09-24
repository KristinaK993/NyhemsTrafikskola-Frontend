export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200">
      <nav
        aria-label="Huvudmeny"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
      >
        <a className="text-lg font-bold tracking-tight" href="/" aria-label="Nyhems Trafikskola startsida">
          Nyhems <span className="text-red-700">Trafikskola</span>
        </a>
      </nav>
    </header>
  )
}
