export interface AuthLogoutRequest {
  userId: string
  refreshToken?: string
  accessToken?: string
  revokeAllTokens?: boolean
}
