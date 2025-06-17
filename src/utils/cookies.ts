import type { Response } from "express"
import { config } from "../config/env"

export class CookieUtils {
  static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = config.nodeEnv === "production"

    // Set access token cookie (30 minutes)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 30 * 60 * 1000, // 30 minutes
      domain: config.cookieDomain,
    })

    // Set refresh token cookie (7 days)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: config.cookieDomain,
    })
  }

  static clearAuthCookies(res: Response): void {
    const isProduction = config.nodeEnv === "production"

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      domain: config.cookieDomain,
    })

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      domain: config.cookieDomain,
    })
  }
}
