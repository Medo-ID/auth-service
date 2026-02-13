import { serve, type BunRequest } from "bun";
import { isAuth } from "./middlewares/auth";
import { errorHandlingMiddleware } from "./middlewares/error";
import { register } from "./routes/register";
import { login } from "./routes/login";
import { refresh } from "./routes/refresh";
import { logout } from "./routes/logout";
import { logoutAll } from "./routes/logoutAll";
import { cleanupRefreshTokens } from "./database/queries/refreshTokens";
import { privatePipe, publicPipe } from "./middlewares/compose";
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
    "/auth/refresh": { POST: privatePipe(refresh) },
    "/auth/logout": { POST: publicPipe(logout) },
    "/auth/logout-all": { POST: publicPipe(logoutAll) },
  },
  error(err) {
    return errorHandlingMiddleware(err);
  },
});

setInterval(cleanupRefreshTokens, 1000 * 60 * 60 * 24);
console.log(`Listening on ${server.url}`);
