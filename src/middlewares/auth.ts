import type { BunRequest, Server } from "bun";
import { verifyToken, type JWTPayload } from "../utils/jwt";
import { parseCookies } from "../utils/cookie";
import { UserNotAuthenticatedError } from "../utils/error";
import { getValidRefreshToken } from "../database/queries/refreshTokens";

export type RouteHandler = (
  req: BunRequest,
  server: Server<undefined>,
) => Promise<Response> | Response;

export interface AuthContext {
  payload: JWTPayload;
  refreshTokenId: string;
}

export type AuthenticatedRequest = BunRequest & AuthContext;

export function isAuth(handler: RouteHandler): RouteHandler {
  return async (req, server) => {
    const cookie = parseCookies(req);
    const refresh = cookie["refresh_token"];

    if (!refresh) {
      throw new UserNotAuthenticatedError("You must be authenticated");
    }

    const payload = await verifyToken(refresh, "refresh");
    if (!payload) {
      throw new UserNotAuthenticatedError("Invalid refresh token");
    }

    const token = await getValidRefreshToken(payload.id, refresh);
    if (!token) {
      throw new UserNotAuthenticatedError("Refresh token revoked or expired");
    }

    (req as AuthenticatedRequest).payload = payload;
    (req as AuthenticatedRequest).refreshTokenId = token.id;

    return handler(req, server);
  };
}
