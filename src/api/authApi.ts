import { apiRequest } from './client'

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  studentProfileId: string | null
  instructorProfileId: string | null
}

export function login(email: string, password: string) {
  return apiRequest<{ message: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me')
}

export function logout() {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' })
}
