import type { BunRequest, Server } from "bun";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
  UserNotAuthenticatedError,
} from "./utils/error";
import { respondWithJSON } from "./utils/json";
import { parseCookies } from "./utils/cookie";
import { verifyToken, type JWTPayload } from "./utils/jwt";
import { getValidRefreshToken } from "./database/queries/refreshTokens";

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

export function errorHandlingMiddleware(err: unknown): Response {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  if (statusCode >= 500) {
    const errStr = errStringFromError(err);
    if (process.env.ENV === "dev") {
      message = errStr;
    }
    console.log(errStr);
  }

  return respondWithJSON(statusCode, { error: message });
}

function errStringFromError(err: unknown) {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "An unknown error occurred";
}
