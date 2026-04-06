export interface TaskScoreConfigRetrieveAllRequest {
  isActive?: boolean
}

export interface TaskScoreConfigRetrieveAllResponse {
  data: TaskScoreConfigResponse[]
  count: number
}

export interface TaskScoreConfigResponse {
  id: string
  priorityLevel: number
  priorityCode: string
  baseScore: number
  recommendedDays: number
  penaltyPerDay: number
  maxPenaltyDays?: number
  description: string
  criteria?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
