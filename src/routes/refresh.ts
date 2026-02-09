import type { BunRequest, Server } from "bun";
import { generateTokens, refreshTokenExpiry } from "../utils/jwt";

import { cookies, serializeCookie } from "../utils/cookie";
import {
  insertRefreshToken,
  revokeRefreshToken,
} from "../database/queries/refreshTokens";
import { respondWithJSON } from "../utils/json";
import type { AuthenticatedRequest } from "../middleware";

export async function refresh(req: BunRequest, server: Server<undefined>) {
  const { payload, refreshTokenId } = req as AuthenticatedRequest;

  await revokeRefreshToken(refreshTokenId);
  const expiresAt = refreshTokenExpiry();
  const { accessToken, refreshToken } = await generateTokens(
    payload,
    "auth-service",
  );

  const userAgent = req.headers.get("user-agent") || null;
  const ipAddress = server.requestIP(req)?.address || null;
  await insertRefreshToken({
    userId: payload.id,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  const newCookie = serializeCookie("refresh_token", refreshToken, cookies);

  return respondWithJSON(200, { accessToken }, { "Set-Cookie": newCookie });
}
