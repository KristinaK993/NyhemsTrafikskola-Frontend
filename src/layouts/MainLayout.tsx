import type { ReactNode } from 'react'
import { SiteHeader } from '../components/SiteHeader'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
