import type { BunRequest } from "bun";
import type { JWTPayload } from "../utils/jwt";

export type RouteHandler = (req: BunRequest) => Promise<Response> | Response;
export type AuthRequest = BunRequest & { session: JWTPayload };
export type RouteHandlerWithAuth = (
  req: AuthRequest,
) => Promise<Response> | Response;
