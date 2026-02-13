import type { BunRequest } from "bun";
import { respondWithJSON } from "../utils/json";

export async function healthCheck(req: BunRequest) {
  const uptime = process.uptime(); // Seconds since start

  // Basic system metrics
  const stats = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    bunVersion: Bun.version,
    memory: {
      // rss = Resident Set Size (Total memory allocated for the process)
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
    env: process.env.ENV || "development",
  };

  return respondWithJSON(200, stats);
}

export async function root(req: BunRequest) {
  return respondWithJSON(200, { message: "Auth Service is Working ..." });
}
