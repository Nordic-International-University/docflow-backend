export interface UserRetrieveOneRequest {
  id: string
}

export interface UserRetrieveOneResponse {
  id: string
  fullname: string
  username: string
  avatarUrl?: string
  isActive: boolean
  role?: {
    id: string
    name: string
  }
  department?: {
    id: string
    name: string
  }
  lastLogin: Date | null
  telegram?: {
    isLinked: boolean
    telegramId?: string
  }
  createdAt: Date
  updatedAt: Date
}
