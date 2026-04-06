export interface ProjectMemberRetrieveOneRequest {
  id: string
}

export interface ProjectMemberRetrieveOneResponse {
  id: string
  projectId: string
  userId: string
  role: string
  joinedAt: Date
  project?: {
    id: string
    name: string
  }
  user?: {
    id: string
    fullname: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}
