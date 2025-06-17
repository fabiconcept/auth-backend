import { Router } from "express"
import { authenticateToken, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

// Example protected route
router.get("/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(req.user)
})

export default router
