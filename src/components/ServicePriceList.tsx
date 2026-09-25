import type { PricedService } from '../data/prices'

const priceFormatter = new Intl.NumberFormat('sv-SE')

type ServicePriceListProps = {
  services: PricedService[]
  note?: string
}

export function ServicePriceList({ services, note }: ServicePriceListProps) {
  return (
    <>
      <div className="price-table-wrap">
        <table className="price-table">
          <thead>
            <tr><th scope="col">Tjänst</th><th scope="col">Pris</th></tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.name}>
                <th scope="row">{service.name}</th>
                <td>{priceFormatter.format(service.price)} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="price-note">{note}</p>}
    </>
  )
}
