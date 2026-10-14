import { apiRequest } from './client'
import type {
  McTrainingInquiry,
  RequestAcceptedResponse,
  RisktvaanMcInquiry,
  TestLessonRequest,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requireAcceptedResponse(value: unknown): RequestAcceptedResponse {
  if (!isRecord(value) || value.status !== 'received' || typeof value.requestId !== 'string') {
    throw new Error('Mottagaren kunde inte bekräfta att förfrågan togs emot.')
  }
  return value as RequestAcceptedResponse
}

export async function createTestLessonRequest(request: TestLessonRequest) {
  const response = await apiRequest<unknown>('/api/requests/test-lessons', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  return requireAcceptedResponse(response)
}

export async function createMcTrainingInquiry(inquiry: McTrainingInquiry) {
  const response = await apiRequest<unknown>('/api/requests/mc-training', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  })
  return requireAcceptedResponse(response)
}

export async function createRisktvaanMcInquiry(inquiry: RisktvaanMcInquiry) {
  const response = await apiRequest<unknown>('/api/requests/risktvaan-mc', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  })
  return requireAcceptedResponse(response)
}
