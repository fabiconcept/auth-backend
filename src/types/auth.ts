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
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string | null
      createdAt?: Date
      updatedAt?: Date
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
  error?: {
    code: string
    message: string
    fields?: Record<string, string | undefined>
    requirements?: {
      minLength?: number
      requireUppercase?: boolean
      requireNumber?: boolean
      requireSpecialChar?: boolean
    }
  }
}
