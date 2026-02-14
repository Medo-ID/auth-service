import { serve, type BunRequest } from "bun";
import { errorHandlingMiddleware } from "./middlewares/error";
import { register } from "./routes/register";
import { login } from "./routes/login";
import { refresh } from "./routes/refresh";
import { logout } from "./routes/logout";
import { logoutAll } from "./routes/logoutAll";
import { cleanupRefreshTokens } from "./database/queries/refreshTokens";
import { privatePipe, publicPipe, refreshPipe } from "./middlewares/compose";
import { healthCheck, root } from "./routes/health";

const server = serve({
  port: 3000,
  routes: {
    // Service-Health
    "/health": { GET: publicPipe(healthCheck) },
    "/": { GET: publicPipe(root) },
    // Auth
    "/auth/register": { POST: publicPipe(register) },
    "/auth/login": { POST: publicPipe(login) },
    // Session Management (Uses Cookie + DB check)
    "/auth/refresh": { POST: refreshPipe(refresh) },
    "/auth/logout": { POST: refreshPipe(logout) },
    // Standard Auth (Uses Bearer Access Token)
    "/auth/logout-all": { POST: privatePipe(logoutAll) },
  },
  error(err) {
    return errorHandlingMiddleware(err);
  },
});

setInterval(cleanupRefreshTokens, 1000 * 60 * 60 * 24);
console.log(`Listening on ${server.url}`);
