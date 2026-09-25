import { PackageCards } from './PackageCards'
import { mcPackageRows, mcPackages } from '../data/prices'

export function McPackageCards() {
  return <PackageCards packages={mcPackages} rows={mcPackageRows} />
}
