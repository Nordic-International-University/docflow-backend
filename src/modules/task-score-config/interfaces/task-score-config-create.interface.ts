export interface TaskScoreConfigCreateRequest {
  priorityLevel: number
  priorityCode: string
  baseScore: number
  recommendedDays: number
  penaltyPerDay: number
  maxPenaltyDays?: number
  description: string
  criteria?: string
  createdBy?: string
}
