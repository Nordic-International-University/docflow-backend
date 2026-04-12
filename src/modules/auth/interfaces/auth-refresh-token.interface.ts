export interface AuthRefreshTokenRequest {
  refreshToken: string
}

export interface AuthRefreshTokenResponse {
  accessToken: string
  refreshToken?: string // rotation — har refresh'da yangi token qaytaradi
}
