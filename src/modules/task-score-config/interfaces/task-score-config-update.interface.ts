export interface TaskScoreConfigUpdateRequest {
  id: string
  priorityCode?: string
  baseScore?: number
  recommendedDays?: number
  penaltyPerDay?: number
  maxPenaltyDays?: number
  description?: string
  criteria?: string
  isActive?: boolean
  updatedBy?: string
}
