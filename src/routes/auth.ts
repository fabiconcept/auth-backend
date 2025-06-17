import { Router } from "express"
import { AuthController } from "../controllers/authController"

const router = Router()

router.post("/login", AuthController.login)
router.post("/refresh", AuthController.refresh)
router.post("/logout", AuthController.logout)
router.post("/register", AuthController.register)

export default router
