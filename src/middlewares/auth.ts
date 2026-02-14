import { verifyToken } from "../utils/jwt";
import { parseCookies } from "../utils/cookie";
import { UserNotAuthenticatedError } from "../utils/error";
import { getValidRefreshToken } from "../database/queries/refreshTokens";
import type { AuthRequest, RefreshRequest, RouteHandler } from "./types";

// 1. General Auth Middleware (Access Token)
// Use this for profile updates, fetching data, etc.
export function isAuth(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new UserNotAuthenticatedError("Missing or malformed access token");
    }

    try {
      const payload = await verifyToken(token, "access", "auth-service");
      (req as AuthRequest).session = payload;
      return handler(req);
    } catch (err) {
      console.error("Auth middleware error", err);
      throw new UserNotAuthenticatedError("Invalid or expired access token");
    }
  };
}

// 2. Refresh Token Middleware
// Use THIS wrapper specifically on your POST /refresh and POST /logout routes
export function requireRefreshToken(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const cookie = parseCookies(req);
    const refresh = cookie["refresh_token"];

    if (!refresh) {
      throw new UserNotAuthenticatedError("No refresh token provided");
    }

    const payload = await verifyToken(refresh, "refresh");
    if (!payload) {
      throw new UserNotAuthenticatedError("Invalid refresh token");
    }

    // Heavy DB check happens ONLY here
    const token = await getValidRefreshToken(payload.sub, refresh);
    if (!token) {
      throw new UserNotAuthenticatedError("Refresh token revoked or expired");
    }

    (req as RefreshRequest).session = payload;
    (req as RefreshRequest).refreshTokenId = token.id;

    return handler(req);
  };
}
