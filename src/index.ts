import { serve, type BunRequest } from "bun";
import { errorHandlingMiddleware, isAuth } from "./middleware";
import { register } from "./routes/register";
import { login } from "./routes/login";
import { refresh } from "./routes/refresh";
import { logout } from "./routes/logout";
import { logoutAll } from "./routes/logoutAll";
import { cleanupRefreshTokens } from "./database/queries/refreshTokens";

const server = serve({
  port: 3000,
  routes: {
    "/": (req: BunRequest) => {
      console.log(server.requestIP(req)?.address || "Unknown IP Address.");
      return new Response("Auth Service is Working...\n");
    },
    "/auth/register": { POST: register },
    "/auth/login": { POST: login },
    "/auth/refresh": { POST: isAuth(refresh) },
    "/auth/logout": { POST: isAuth(logout) },
    "/auth/logout-all": { POST: isAuth(logoutAll) },
  },
  error(err) {
    return errorHandlingMiddleware(err);
  },
});

setInterval(cleanupRefreshTokens, 1000 * 60 * 60 * 24);
console.log(`Listening on ${server.url}`);
