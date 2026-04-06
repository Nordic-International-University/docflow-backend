export interface TaskDependencyRetrieveOneRequest {
  id: string
}

export interface TaskDependencyRetrieveOneResponse {
  id: string
  taskId: string
  dependsOnTaskId: string
  task: {
    id: string
    title: string
    status: string
    priority: string
  }
  dependsOnTask: {
    id: string
    title: string
    status: string
    priority: string
  }
  createdAt: Date
}
