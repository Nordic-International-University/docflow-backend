export interface Journal {
  id: string
  name: string
  prefix: string
  format: string
  department?: {
    id: string
    name: string
  }
  responsibleUser?: {
    id: string
    fullname: string
    username: string
  }
}
