import type { RouteHandler } from "./types";

export function logger(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const start = performance.now();
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    try {
      const response = await handler(req);
      const duration = (performance.now() - start).toFixed(2);

      console.log(
        JSON.stringify({
          time: new Date().toISOString(),
          method: req.method,
          path: new URL(req.url).pathname,
          status: response.status,
          duration: `${duration}ms`,
          ip,
        }),
      );

      return response;
    } catch (err) {
      const duration = (performance.now() - start).toFixed(2);
      console.error(
        JSON.stringify({
          time: new Date().toISOString(),
          method: req.method,
          path: new URL(req.url).pathname,
          error: (err as Error).message,
          duration: `${duration}ms`,
          ip,
        }),
      );

      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
