import type { BunRequest } from "bun";
import { serializeCookie } from "../utils/cookie";
import { respondWithJSON } from "../utils/json";
import { revokeRefreshToken } from "../database/queries/refreshTokens";
import type { AuthenticatedRequest } from "../middleware";

export async function logout(req: BunRequest) {
  const { refreshTokenId } = req as AuthenticatedRequest;

  await revokeRefreshToken(refreshTokenId);

  const clearCookie = serializeCookie("refresh_token", "", {
    path: "/auth",
    maxAge: 0,
  });

  return respondWithJSON(204, null, { "Set-Cookie": clearCookie });
}
