import type { BunRequest } from "bun";
import { serializeCookie } from "../utils/cookie";
import { revokeAllRefreshTokens } from "../database/queries/refreshTokens";
import { respondWithJSON } from "../utils/json";
import type { AuthRequest } from "../middlewares/types";

export async function logoutAll(req: BunRequest) {
  const { session } = req as AuthRequest;

  await revokeAllRefreshTokens(session.sub);

  const clearRefresh = serializeCookie("refresh_token", "", {
    path: "/auth",
    maxAge: 0,
  });

  return respondWithJSON(204, null, { "Set-Cookie": clearRefresh });
}
