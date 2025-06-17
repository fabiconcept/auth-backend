import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { config } from "./config/env"
import authRoutes from "./routes/auth"
import protectedRoutes from "./routes/protected"

const app = express()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit,
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Auth rate limiting (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.authRateLimit,
  message: "Too many authentication attempts, please try again later.",
})

app.use(
  cors({
    origin: "http://localhost:3002",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() })
})

// Routes
// Apply auth rate limiter only in non-test environments
if (config.nodeEnv !== "test") {
  app.use("/auth", authLimiter, authRoutes)
} else {
  // In test environment, we don't want to rate limit auth routes
  app.use("/auth", authRoutes)
}
app.use("/api", protectedRoutes)

// 404 handler
app.use("*", (_req, res) => { 
  res.status(404).json({ error: "Route not found" })
})

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

export default app;