export interface SavedPAN {
  id: string
  pan: string
  nickname: string
}

export type AllotmentStatus = 'ALLOTTED' | 'NOT_ALLOTTED' | 'PENDING' | null

export interface PANResult {
  pan: string
  status: AllotmentStatus
  shares: number
  message: string
}
