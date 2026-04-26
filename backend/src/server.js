require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

let server;

/* ------------------------------ */
/* START SERVER                   */
/* ------------------------------ */

async function startServer() {
  try {
    await prisma.$connect();

    server = app.listen(PORT, () => {
      console.log("🚀 Backend is running");
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
      console.log("🟢 Database connected");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

/* ------------------------------ */
/* CHECK IF SERVER RUNNING        */
/* ------------------------------ */

function isServerRunning() {
  return server && server.listening;
}

/* ------------------------------ */
/* GRACEFUL SHUTDOWN              */
/* ------------------------------ */

async function gracefulShutdown(signal) {
  console.log(`\n⚠️ ${signal} received. Shutting down...`);

  try {
    if (isServerRunning()) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log("🛑 HTTP server closed");
    } else {
      console.log("ℹ️ Server already stopped");
    }

    await prisma.$disconnect();
    console.log("🔌 Database disconnected");

    console.log("🌙 Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Shutdown error:", error.message);
    process.exit(1);
  }
}

/* ------------------------------ */
/* PROCESS EVENTS                 */
/* ------------------------------ */

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", async (error) => {
  console.error("💥 Uncaught Exception:", error);
  await gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", async (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  await gracefulShutdown("unhandledRejection");
});

/* ------------------------------ */
/* BOOT                           */
/* ------------------------------ */

startServer();