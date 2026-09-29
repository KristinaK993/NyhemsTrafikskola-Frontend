const apiBaseUrl = import.meta.env.VITE_DOTNET_API_BASE_URL?.replace(/\/$/, '')
let csrfRequestToken: string | null = null

export const isBookingApiConfigured = Boolean(apiBaseUrl)

export class BookingApiUnavailableError extends Error {
  constructor() {
    super('API:t är inte konfigurerat. Kontrollera VITE_DOTNET_API_BASE_URL.')
    this.name = 'BookingApiUnavailableError'
  }
}

export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiRequestError'
  }
}

export const isApiConfigured = Boolean(apiBaseUrl)

function isWriteMethod(method: string) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

async function readErrorMessage(response: Response) {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') return body.message
    if (typeof body === 'object' && body !== null && 'title' in body && typeof body.title === 'string') return body.title
  } catch {
    // Non-JSON error response.
  }
  return `Begäran misslyckades (HTTP ${response.status}).`
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new BookingApiUnavailableError()

  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (isWriteMethod(init?.method ?? 'GET') && csrfRequestToken) headers.set('X-XSRF-TOKEN', csrfRequestToken)

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  const newCsrfToken = response.headers.get('X-XSRF-TOKEN')
  if (newCsrfToken) csrfRequestToken = newCsrfToken

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function clearCsrfRequestToken() {
  csrfRequestToken = null
}
