import { StructuredPermissions } from '@common'

export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthLoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    fullname: string
    role: string | null
    permissions: StructuredPermissions
  }
}
