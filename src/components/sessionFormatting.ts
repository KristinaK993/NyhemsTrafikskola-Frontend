const dateFormatter = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false })

export function formatSessionDate(dateString: string) {
  return dateFormatter.format(new Date(dateString))
}

export function formatSessionTimeRange(startTime: string, endTime: string) {
  return `${timeFormatter.format(new Date(startTime))}–${timeFormatter.format(new Date(endTime))}`
}
