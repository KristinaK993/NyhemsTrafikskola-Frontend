const apiBaseUrl = import.meta.env.VITE_DOTNET_API_BASE_URL?.replace(/\/$/, '')

export const isBookingApiConfigured = Boolean(apiBaseUrl)

export class BookingApiUnavailableError extends Error {
  constructor() {
    super('Bokningssystemet är inte tillgängligt ännu. Dina uppgifter har inte skickats.')
    this.name = 'BookingApiUnavailableError'
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new BookingApiUnavailableError()

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Begäran misslyckades (HTTP ${response.status}).`)
  }

  return response.json() as Promise<T>
}
