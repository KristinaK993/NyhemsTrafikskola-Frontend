import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
