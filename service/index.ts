import { serve } from "bun";
import { errorHandlingMiddleware } from "./middleware";

serve({
  port: 3000,
  routes: {
    "/auth/register": {
      POST: () => new Response(),
    },
    "/auth/login": {
      POST: () => new Response(),
    },
    "/auth/refresh_token": {
      POST: () => new Response(),
    },
  },
  error(err) {
    return errorHandlingMiddleware(err);
  },
});
