import type { ReactNode } from 'react'
import { Button } from './Button'
import { BookingLink } from './BookingLink'

type InformationPageProps = {
  title: string
  description: string
  image?: string
  imageAlt?: string
  details?: string
  actionLabel?: string
  actionTo?: string
  bookingAction?: boolean
  actions?: ReactNode
}

export function InformationPage({
  title,
  description,
  image,
  imageAlt,
  details,
  actionLabel = 'Kontakta oss',
  actionTo = '/kontakt',
  bookingAction = false,
  actions,
}: InformationPageProps) {
  return (
    <article className={`information-page${image ? ' information-page-with-image' : ' information-page-text-only'}`}>
      <div className="information-page-main">
        <div className="information-page-copy">
          <h1>{title}</h1>
          <p>{description}</p>
          {details && <p className="information-page-details">{details}</p>}
          {actions ?? (bookingAction ? (
            <BookingLink>{actionLabel} <span aria-hidden="true">↗</span></BookingLink>
          ) : (
            <Button to={actionTo}>{actionLabel} <span aria-hidden="true">↗</span></Button>
          ))}
        </div>
        {image && <img className="information-page-image" src={image} alt={imageAlt ?? ''} />}
      </div>
    </article>
  )
}
