import type { BunRequest, Server } from "bun";
import { BadRequestError } from "../utils/error";
import { getUserByEmail, getUserById } from "../database/queries/users";
import { verifyPassword } from "../utils/hash";
import { generateTokens, refreshTokenExpiry } from "../utils/jwt";
import { insertRefreshToken } from "../database/queries/refreshTokens";
import { respondWithJSON } from "../utils/json";
import { cookies, serializeCookie } from "../utils/cookie";
import { validateEmail, validatePassword } from "../utils/validation";

type LoginData = {
  email: string;
  password: string;
};

export async function login(req: BunRequest, server: Server<undefined>) {
  const body = (await req.json()) as LoginData;
  const email = validateEmail(body.email);
  const password = validatePassword(body.password);

  const existsUser = await getUserByEmail(email);
  if (!existsUser) {
    throw new BadRequestError("Invalid credentials!");
  }

  const isMatch = await verifyPassword(password, existsUser.password);
  if (!isMatch) {
    throw new BadRequestError("Invalid credentials!");
  }

  const user = await getUserById(existsUser.id);
  if (!user) {
    throw new BadRequestError("Can't find user!");
  }
  const expiresAt = refreshTokenExpiry();
  const { accessToken, refreshToken } = await generateTokens(
    {
      id: user.id,
      email: user.email,
    },
    "auth-service",
  );

  const userAgent = req.headers.get("user-agent") || null;
  const ipAddress = server.requestIP(req)?.address || null;
  await insertRefreshToken({
    userId: user.id,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  const refreshCookie = serializeCookie("refresh_token", refreshToken, cookies);

  return respondWithJSON(
    200,
    { ...user, accessToken },
    { "Set-Cookie": refreshCookie },
  );
}
