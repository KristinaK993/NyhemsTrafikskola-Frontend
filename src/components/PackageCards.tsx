import { Button } from './Button'
import type { CoursePackage } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

type PackageCardsProps = {
  packages: CoursePackage[]
  rows: string[]
  columns?: 2 | 3
}

export function PackageCards({ packages, rows, columns = 2 }: PackageCardsProps) {
  return (
    <div className={`mc-package-grid${columns === 3 ? ' package-grid-three' : ''}`}>
      {packages.map((coursePackage) => (
        <article className="mc-package-card" key={coursePackage.name}>
          <h3>{coursePackage.name}</h3>
          <p className="mc-package-price">{priceFormatter.format(coursePackage.price)} kr</p>
          <ul>
            {rows.map((row, index) => {
              const value = coursePackage.values[index]
              return (
                <li key={row}>
                  <span>{row}</span>
                  {typeof value === 'boolean' ? (
                    <span className={`package-symbol${value ? ' package-included' : ' package-excluded'}`} role="img" aria-label={value ? 'Ingår' : 'Ingår inte'}>
                      {value ? '✓' : '×'}
                    </span>
                  ) : (
                    <span className="package-value">{value}</span>
                  )}
                </li>
              )
            })}
          </ul>
          <Button to="/kontakt">Kontakta oss</Button>
        </article>
      ))}
    </div>
  )
}
