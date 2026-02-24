import { serve } from "bun";
import { errorHandlingMiddleware } from "./middlewares/error";
import { register } from "./routes/register";
import { login } from "./routes/login";
import { refresh } from "./routes/refresh";
import { logout } from "./routes/logout";
import { logoutAll } from "./routes/logoutAll";
import { cleanupRefreshTokens } from "./database/queries/refreshTokens";
import { publicPipe, refreshPipe } from "./middlewares/compose";
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
    "/auth/logout-all": { POST: refreshPipe(logoutAll) },
  },
  error(err) {
    return errorHandlingMiddleware(err);
  },
});

setInterval(cleanupRefreshTokens, 1000 * 60 * 60 * 24);
console.log(`Listening on ${server.url}`);

// {"time":"2026-02-23T16:08:18.076Z","method":"POST","path":"/auth/refresh","error":"Refresh token revoked or expired","duration":"1005.05ms","ip":"unknown"}
