import type { RouteHandler } from "./types";

// Move this to your .env later
const ALLOWED_ORIGINS = ["*"];

export function cors(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const origin = req.headers.get("origin");
    const allowAll = ALLOWED_ORIGINS.includes("*");

    // Check if the incoming origin is in our whitelist
    const isAllowed =
      allowAll || (!!origin && ALLOWED_ORIGINS.includes(origin));

    // 1. Handle Preflight (OPTIONS)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(origin, isAllowed, allowAll),
      });
    }

    // 2. Execute the actual handler
    const response = await handler(req);

    // 3. Clone headers and attach CORS
    const headers = new Headers(response.headers);
    const corsHeaders = buildCorsHeaders(origin, isAllowed, allowAll);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
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
  // If not allowed, return nothing (standard browser behavior)
  if (!allowed) return {};

  const finalOrigin = allowAll ? "*" : origin || "";
  const allowCredentials = allowAll ? "false" : "true";

  return {
    "Access-Control-Allow-Origin": finalOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": allowCredentials,
    "Access-Control-Max-Age": "86400", // Cache preflight for 24h
  };
}
