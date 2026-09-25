import type { ReactNode } from 'react'
import { Button } from './Button'

type BookingLinkProps = {
  children: ReactNode
}

export function BookingLink({ children }: BookingLinkProps) {
  return <Button to="/forfragan-testlektion">{children}</Button>
}
