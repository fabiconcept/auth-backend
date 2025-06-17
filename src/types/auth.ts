export interface JWTPayload {
  sub: string // userId
  email: string
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  sub: string // userId
  jti: string // refresh token id
  iat: number
  exp: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string | null
  }
  accessToken: string
}
