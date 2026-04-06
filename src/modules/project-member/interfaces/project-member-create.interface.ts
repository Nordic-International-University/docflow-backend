export interface ProjectMemberCreateRequest {
  projectId: string
  userId: string
  role?: string
  createdBy?: string
}
