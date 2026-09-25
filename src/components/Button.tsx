import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  to?: string
  href?: string
  disabled?: boolean
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  to,
  href,
  disabled = false,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
}: ButtonProps) {
  const classes = `button button-${variant}${disabled ? ' button-disabled' : ''} ${className}`.trim()

  if (to) {
    return <Link className={classes} to={to}>{children}</Link>
  }

  if (href) {
    return <a className={classes} href={href}>{children}</a>
  }

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </button>
  )
}
