import type { RouteHandler } from "./types";

const ALLOWED_ORIGINS = ["*"];

export function cors(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const origin = req.headers.get("origin");
    const allowAll = ALLOWED_ORIGINS.includes("*");
    const isAllowed =
      !!origin && (allowAll || ALLOWED_ORIGINS.includes(origin));

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(origin, isAllowed, allowAll),
      });
    }
    console.log(origin, allowAll, isAllowed);
    const response = await handler(req);
    const headers = new Headers(response.headers);
    const corsHeaders = buildCorsHeaders(origin, isAllowed, allowAll);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  };
}

function buildCorsHeaders(
  origin: string | null,
  allowed: boolean,
  allowAll: boolean,
): Record<string, string> {
  if (!origin || !allowed) return {};

  const allowOrigin = allowAll ? "*" : origin;
  const allowCredentials = allowAll ? "false" : "true";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": allowCredentials,
  };
}
