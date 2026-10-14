import { apiRequest } from './client'

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  roles: string[]
  studentProfileId: string | null
  instructorProfileId: string | null
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

export function login(email: string, password: string) {
  return apiRequest<{ message: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<{ message: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me')
}

export function logout() {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' })
}
