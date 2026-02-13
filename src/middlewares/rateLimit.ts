import type { RouteHandler } from "./types";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const store = new Map<string, { count: number; expires: number }>();

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max } = options;

  return function (handler: RouteHandler): RouteHandler {
    return async (req) => {
      const ip = req.headers.get("x-forwarded-for") || "unknown";

      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || entry.expires < now) {
        store.set(ip, { count: 1, expires: now + windowMs });
      } else {
        entry.count += 1;

        if (entry.count > max) {
          return new Response("Too Many Requests", {
            status: 429,
          });
        }
      }

      return handler(req);
    };
  };
}

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (entry.expires < now) {
        store.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);
