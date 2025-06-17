import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 5222,
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key",
  nodeEnv: process.env.NODE_ENV || "development",
  cookieDomain: process.env.COOKIE_DOMAIN,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3002",
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 5,
  rateLimit: Number(process.env.RATE_LIMIT) || 100,
}

if (config.nodeEnv === "development") {
  config.authRateLimit = 50
  config.rateLimit = 100
}

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET not set in environment variables")
}

if (!process.env.JWT_REFRESH_SECRET) {
  console.warn("Warning: JWT_REFRESH_SECRET not set in environment variables")
}
