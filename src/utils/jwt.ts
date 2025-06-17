import jwt from "jsonwebtoken"
import { config } from "../config/env"
import type { JWTPayload, RefreshTokenPayload } from "../types/auth"

export class JWTUtils {
  static generateAccessToken(userId: string, email: string): string {
    const payload: Omit<JWTPayload, "iat" | "exp"> = {
      sub: userId,
      email,
    }

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: "1m",
      algorithm: "HS256",
    })
  }

  static generateRefreshToken(userId: string, jti: string): string {
    const payload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
      sub: userId,
      jti,
    }

    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: "7d",
      algorithm: "HS256",
    })
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload
    } catch (error) {
      throw new Error("Invalid access token")
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload
    } catch (error) {
      throw new Error("Invalid refresh token")
    }
  }
}
