export interface TaskCommentCreateRequest {
  taskId: string
  content: string
  parentCommentId?: string
  userId: string
}
