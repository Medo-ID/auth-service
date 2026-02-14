import type { BunRequest } from "bun";
import { generateTokens, refreshTokenExpiry } from "../utils/jwt";

import { cookies, serializeCookie } from "../utils/cookie";
import {
  insertRefreshToken,
  revokeRefreshToken,
} from "../database/queries/refreshTokens";
import { respondWithJSON } from "../utils/json";
import type { RefreshRequest } from "../middlewares/types";

export async function refresh(req: BunRequest) {
  // Now casting to RefreshRequest to access the DB token ID
  const { session, refreshTokenId } = req as RefreshRequest;

  await revokeRefreshToken(refreshTokenId);
  const expiresAt = refreshTokenExpiry();

  const { accessToken, refreshToken } = await generateTokens(session, [
    "auth-service",
    "files-service",
  ]);

  const userAgent = req.headers.get("user-agent") || null;
  const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

  await insertRefreshToken({
    userId: session.sub,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  const newCookie = serializeCookie("refresh_token", refreshToken, cookies);

  return respondWithJSON(200, { accessToken }, { "Set-Cookie": newCookie });
}
