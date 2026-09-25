export type PackageValue = string | boolean

export type CoursePackage = {
  name: string
  price: number
  values: PackageValue[]
}

export type PricedService = {
  name: string
  price: number
}

export const carPackageRows = ['Anmälningsavgift', 'Körlektioner', 'Riskettan', 'Risktvåan']
export const carPackages: CoursePackage[] = [
  { name: 'Minipaket', price: 6400, values: [true, '8 st', false, false] },
  { name: 'Körpaket', price: 6700, values: [true, '10 st', false, false] },
  { name: 'Mixpaket 1', price: 10950, values: [true, '15 st', true, false] },
  { name: 'Mixpaket 2', price: 16400, values: [true, '20 st', true, true] },
  { name: 'Mixpaket 3', price: 22900, values: [true, '30 st', true, true] },
  { name: 'Mixpaket 4', price: 29400, values: [true, '40 st', true, true] },
]

export const carRiskettanPrice = 1000

export const carServices: PricedService[] = [
  { name: 'Anmälningsavgift', price: 200 },
  { name: 'Körkortsbok', price: 350 },
  { name: 'Körlektion 40 min (inkl. inledning och avslut)', price: 650 },
  { name: 'Körlektion 40 min, lördag (inkl. inledning och avslut)', price: 680 },
  { name: 'Lån av bil vid körprov', price: 1100 },
  { name: 'Lån av bil vid körprov, lördag', price: 1300 },
  { name: 'Riskettan bil', price: carRiskettanPrice },
  { name: 'Risktvåan bil (halka)', price: 2200 },
  { name: 'Handledarbok', price: 150 },
]

export const mcPackageRows = ['Anmälningsavgift', 'MC-bok', 'Körlektioner', 'Riskettan MC', 'Risktvåan MC']
export const mcPackages: CoursePackage[] = [
  { name: 'MC-Minipaket', price: 14400, values: [true, true, '10 st', false, false] },
  { name: 'MC-Startpaket', price: 25100, values: [true, true, '15 st', true, true] },
]

export const mcRiskettanPrice = 1000
export const mcRisktvaanPrice = 3300

export const mcServices: PricedService[] = [
  { name: 'Anmälningsavgift', price: 200 },
  { name: 'MC-körlektion', price: 1350 },
  { name: 'MC-körlektion helg', price: 1500 },
  { name: 'Riskettan MC', price: mcRiskettanPrice },
  { name: 'Risktvåan MC', price: mcRisktvaanPrice },
  { name: 'Manöverbana', price: 500 },
  { name: 'Lån av MC vid uppkörning', price: 1500 },
]
