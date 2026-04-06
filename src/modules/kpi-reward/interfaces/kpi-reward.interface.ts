export interface KpiRewardRetrieveAllRequest {
  userId?: string
  year?: number
  month?: number
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface KpiRewardRetrieveAllResponse {
  data: KpiRewardResponse[]
  count: number
  pageNumber: number
  pageSize: number
}

export interface KpiRewardResponse {
  id: string
  userMonthlyKpiId: string
  rewardTierId?: string
  rewardTier?: {
    id: string
    name: string
    color?: string
  }
  userId: string
  user?: {
    id: string
    fullname: string
    username: string
    avatarUrl?: string
  }
  year: number
  month: number
  finalScore: number
  rewardAmount?: number
  rewardBhm?: number
  isPenalty: boolean
  penaltyType?: string
  status: string
  approvedById?: string
  approvedBy?: {
    id: string
    fullname: string
  }
  approvedAt?: Date
  paidAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface KpiRewardApproveRequest {
  id: string
  approvedById: string
  notes?: string
}

export interface KpiRewardPayRequest {
  id: string
  paidBy: string
  notes?: string
}

export interface KpiRewardRejectRequest {
  id: string
  rejectedBy: string
  notes: string
}
