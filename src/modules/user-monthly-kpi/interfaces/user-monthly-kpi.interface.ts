export interface UserMonthlyKpiRetrieveAllRequest {
  userId?: string
  departmentId?: string
  year?: number
  month?: number
  isFinalized?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface UserMonthlyKpiRetrieveAllResponse {
  data: UserMonthlyKpiResponse[]
  count: number
  pageNumber: number
  pageSize: number
}

export interface UserMonthlyKpiResponse {
  id: string
  userId: string
  user?: {
    id: string
    fullname: string
    username: string
    avatarUrl?: string
  }
  departmentId?: string
  department?: {
    id: string
    name: string
  }
  year: number
  month: number
  totalBaseScore: number
  totalEarnedScore: number
  totalPenalty: number
  tasksCompleted: number
  tasksOnTime: number
  tasksLate: number
  finalScore: number
  isFullScore: boolean
  consecutiveFullMonths: number
  isFinalized: boolean
  finalizedAt?: Date
  scoreBreakdown?: Record<string, { count: number; earned: number }>
  createdAt: Date
  updatedAt: Date
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  user: {
    id: string
    fullname: string
    username: string
    avatarUrl?: string
  }
  department?: {
    id: string
    name: string
  }
  finalScore: number
  tasksCompleted: number
  tasksOnTime: number
}

export interface LeaderboardRequest {
  year: number
  month: number
  departmentId?: string
  limit?: number
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  period: {
    year: number
    month: number
  }
}

export interface TaskKpiScoreCreateRequest {
  taskId: string
  userId: string
  priorityLevel: number
  dueDate: Date
  completedDate: Date
}

export interface TaskKpiScoreResponse {
  id: string
  taskId: string
  userId: string
  baseScore: number
  earnedScore: number
  penaltyApplied: number
  dueDate: Date
  completedDate: Date
  daysLate: number
  periodYear: number
  periodMonth: number
  breakdown?: {
    baseScore: number
    daysLate: number
    penaltyPerDay: number
    totalPenalty: number
    earned: number
  }
  createdAt: Date
}
