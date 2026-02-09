import type { BunRequest } from "bun";
import { serializeCookie } from "../utils/cookie";
import { revokeAllRefreshTokens } from "../database/queries/refreshTokens";
import { respondWithJSON } from "../utils/json";
import type { AuthenticatedRequest } from "../middleware";

export async function logoutAll(req: BunRequest) {
  const { payload } = req as AuthenticatedRequest;

  await revokeAllRefreshTokens(payload.id);

  const clearRefresh = serializeCookie("refresh_token", "", {
    path: "/auth",
    maxAge: 0,
  });

  return respondWithJSON(204, null, { "Set-Cookie": clearRefresh });
}
