import type { Request, Response, NextFunction } from "express"
import { JWTUtils } from "../utils/jwt"
import { prisma } from "../config/database"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken

    if (!accessToken) {
      res.status(401).json({ error: "Access token required" })
      return
    }

    const payload = JWTUtils.verifyAccessToken(accessToken)

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      res.status(401).json({ error: "User not found" })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid access token" })
  }
}
