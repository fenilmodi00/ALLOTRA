import type { AllotmentStatus } from '../../types'

const KNOWN: Record<string, AllotmentStatus> = {
  ALLOTTED: 'ALLOTTED',
  NOT_ALLOTTED: 'NOT_ALLOTTED',
  PENDING: 'PENDING',
  NOT_APPLIED: 'NOT_APPLIED',
}

export const mapAllotmentStatus = (status: string): AllotmentStatus => {
  return KNOWN[status.toUpperCase()] ?? 'PENDING'
}
