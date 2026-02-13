import { isAuth } from "./auth";
import { cors } from "./cors";
import { logger } from "./logger";
import { rateLimit } from "./rateLimit";

export function compose(...middlewares: Function[]) {
  return (handler: any) =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

export const publicPipe = compose(cors, logger);
export const privatePipe = compose(
  cors,
  logger,
  rateLimit({ windowMs: 60000, max: 100 }),
  isAuth,
);
