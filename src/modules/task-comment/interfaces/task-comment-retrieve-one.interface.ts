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
    username: string
    avatarUrl?: string
  }
  replyTo?: {
    id: string
    content: string
    user: { id: string; fullname: string; username: string }
  } | null
  reactions: any[]
  attachments: any[]
  mentions: any[]
  reactionsCount: number
  createdAt: Date
  updatedAt: Date
}
