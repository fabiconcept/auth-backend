import type { Request, Response } from "express"
import { Prisma } from "@prisma/client"
import { prisma } from "../config/database"
import { JWTUtils } from "../utils/jwt"
import { PasswordUtils } from "../utils/password"
import { CookieUtils } from "../utils/cookies"
import type { LoginRequest, AuthResponse, RegisterRequest } from "../types/auth"
import { v4 as uuidv4 } from "uuid"

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name }: RegisterRequest = req.body

      if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required" })
        return
      }

      const hashedPassword = await PasswordUtils.hash(password)

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
        },
      })

      res.status(201).json({ id: user.id, email: user.email, name: user.name })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: "Email already in use" })
      } else {
        console.error("Registration error:", error)
        res.status(500).json({ error: "Internal server error" })
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" })
        return
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" })
        return
      }

      // Verify password
      const isValidPassword = await PasswordUtils.verify(password, user.password)
      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid credentials" })
        return
      }

      // Generate tokens
      const jti = uuidv4()
      const accessToken = JWTUtils.generateAccessToken(user.id, user.email)
      const refreshToken = JWTUtils.generateRefreshToken(user.id, jti)

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          id: jti,
          jti,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      // Set cookies
      CookieUtils.setAuthCookies(res, accessToken, refreshToken)

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
      }

      res.status(200).json(response)
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token required" })
        return
      }

      // Verify refresh token
      const payload = JWTUtils.verifyRefreshToken(refreshToken)

      // Check if refresh token exists and is not revoked
      const storedToken = await prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
        include: { user: true },
      })

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        res.status(401).json({ error: "Invalid refresh token" })
        return
      }

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { jti: payload.jti },
        data: { revoked: true },
      })

      // Generate new tokens
      const newJti = uuidv4()
      const newAccessToken = JWTUtils.generateAccessToken(storedToken.user.id, storedToken.user.email)
      const newRefreshToken = JWTUtils.generateRefreshToken(storedToken.user.id, newJti)

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          id: newJti,
          jti: newJti,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      // Set new cookies
      CookieUtils.setAuthCookies(res, newAccessToken, newRefreshToken)

      const response: AuthResponse = {
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
        },
        accessToken: newAccessToken,
      }

      res.status(200).json(response)
    } catch (error) {
      console.error("Refresh error:", error)
      res.status(401).json({ error: "Invalid refresh token" })
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      try {
        const payload = JWTUtils.verifyRefreshToken(refreshToken)

        // Revoke refresh token in database
        await prisma.refreshToken.updateMany({
          where: {
            jti: payload.jti,
            revoked: false,
          },
          data: { revoked: true },
        })
      } catch (error) {
        // Token might be invalid, but we still want to clear cookies
        console.warn("Error verifying/revoking refresh token during logout:", error)
      }
    }

    // Always clear cookies, even if token was invalid or revocation failed
    CookieUtils.clearAuthCookies(res)
    res.status(200).json({ message: "Logged out successfully" })
  }
}