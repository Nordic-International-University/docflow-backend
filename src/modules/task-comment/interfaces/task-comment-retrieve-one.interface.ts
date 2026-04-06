export interface TaskCommentRetrieveOneRequest {
  id: string
}

export interface TaskCommentRetrieveOneResponse {
  id: string
  taskId: string
  userId: string
  content: string
  parentCommentId?: string
  isEdited: boolean
  editedAt?: Date
  user: {
    id: string
    fullname: string
    avatar?: string
  }
  repliesCount: number
  reactionsCount: number
  createdAt: Date
  updatedAt: Date
}
