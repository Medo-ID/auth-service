import { isAuth, requireRefreshToken } from "./auth";
import { cors } from "./cors";
import { logger } from "./logger";
import { rateLimit } from "./rateLimit";

export function compose(...middlewares: Function[]) {
  return (handler: any) =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

export const publicPipe = compose(
  cors,
  logger,
  rateLimit({ windowMs: 60000, max: 100 }),
);

// Used for standard API calls (requires Bearer Access Token)
export const privatePipe = compose(
  cors,
  logger,
  rateLimit({ windowMs: 60000, max: 100 }),
  isAuth,
);

// Used ONLY for session management (requires Cookie Refresh Token)
export const refreshPipe = compose(
  cors,
  logger,
  rateLimit({ windowMs: 60000, max: 100 }),
  requireRefreshToken,
);
