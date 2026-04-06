export interface ProjectLabelCreateRequest {
  projectId: string
  name: string
  color: string
  description?: string
  createdBy?: string
}
