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
  // Set when the API reports which input field the error belongs to.
  readonly field?: string

  constructor(message: string, status: number, field?: string) {
    super(message)
    this.status = status
    this.field = field
    this.name = 'ApiRequestError'
  }
}

export const isApiConfigured = Boolean(apiBaseUrl)

function isWriteMethod(method: string) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

async function readError(response: Response): Promise<{ message: string; field?: string }> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null) {
      const field = 'field' in body && typeof body.field === 'string' ? body.field : undefined
      if ('message' in body && typeof body.message === 'string') return { message: body.message, field }
      if ('title' in body && typeof body.title === 'string') return { message: body.title, field }
    }
  } catch {
    // Non-JSON error response.
  }
  return { message: `Begäran misslyckades (HTTP ${response.status}).` }
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
    const { message, field } = await readError(response)
    throw new ApiRequestError(message, response.status, field)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function clearCsrfRequestToken() {
  csrfRequestToken = null
}
