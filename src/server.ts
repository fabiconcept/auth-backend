import app from "./app"
import { config } from "./config/env"
import { prisma } from "./config/database"
import listEndpoints from "express-list-endpoints"

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    // Start server
    let currentPort = config.port;

    function startServer(port: number) {
      const server = app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`)
        console.log(`📝 Environment: ${config.nodeEnv}`)
        console.log('\nUse this link to access the backend server: \x1b[34m\x1b[4m%s\x1b[0m', `http://localhost:${port}`);

        // Log all registered routes
        console.log("\n📋 Registered routes:");
        listEndpoints(app).forEach((route) => {
          route.methods.forEach((method) => {
            console.log(`  - ${method}: ${route.path}`);
          });
        });
      }).on("error", (error) => {
        if (error instanceof Error) {
          if (error.message.includes("EADDRINUSE")) {
            console.log(`⚠️  Port ${port} is already in use, trying port ${port + 1}...`);
            currentPort = port + 1;
            startServer(currentPort);
          } else {
            console.error("❌ Failed to start server:", error);
            process.exit(1);
          }
        }
      });

      return server;
    }
    
    startServer(currentPort);
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...")
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down server...")
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
