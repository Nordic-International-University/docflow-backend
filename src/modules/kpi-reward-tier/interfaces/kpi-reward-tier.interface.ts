export interface KpiRewardTierCreateRequest {
  minScore: number
  maxScore: number
  rewardBhm?: number
  rewardAmount?: number
  isPenalty?: boolean
  penaltyType?: string
  name: string
  description?: string
  color?: string
  createdBy?: string
}

export interface KpiRewardTierUpdateRequest {
  id: string
  minScore?: number
  maxScore?: number
  rewardBhm?: number
  rewardAmount?: number
  isPenalty?: boolean
  penaltyType?: string
  name?: string
  description?: string
  color?: string
  isActive?: boolean
  updatedBy?: string
}

export interface KpiRewardTierRetrieveAllRequest {
  isActive?: boolean
}

export interface KpiRewardTierRetrieveAllResponse {
  data: KpiRewardTierResponse[]
  count: number
}

export interface KpiRewardTierResponse {
  id: string
  minScore: number
  maxScore: number
  rewardBhm?: number
  rewardAmount?: number
  isPenalty: boolean
  penaltyType?: string
  name: string
  description?: string
  color?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
