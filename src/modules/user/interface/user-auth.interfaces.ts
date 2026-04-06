export interface UserLoginRequest {
  username: string
  password: string
}

export interface UserLoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    fullname: string
    bio: string | null
  }
}

export interface UserRefreshTokenRequest {
  refreshToken: string
}

export interface UserRefreshTokenResponse {
  accessToken: string
}

export interface UserProfileResponse {
  id: string
  username: string
  fullname: string
  role: {
    id: string
    name: string
  }
  permissions: any[]
}

export interface UserUpdateProfileRequest {
  fullname: string
  bio?: string
}
