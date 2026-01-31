import { jwtVerify, SignJWT } from "jose";
import { createSecretKey } from "node:crypto";

export interface JWTPayload {
  id: string;
  email: string;
  [key: string]: unknown;
}

const accessSecret = process.env.ACCESS_SECRET;
const refreshSecret = process.env.REFRESH_SECRET;

const accessExp = process.env.ACCESS_EXP;
const refreshExp = process.env.REFRESH_EXP;

export async function generateTokens(payload: JWTPayload) {
  if (!accessSecret) {
    throw new Error("Access secret is required to generate access token!");
  }

  const accessKey = createSecretKey(accessSecret, "utf-8");
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessExp || "15m")
    .sign(accessKey);

  if (!refreshSecret) {
    throw new Error("Refresh secret is required to generate refresh token!");
  }

  const refreshKey = createSecretKey(refreshSecret, "utf-8");
  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshExp || "15m")
    .sign(refreshKey);

  return { accessToken, refreshToken };
}

export async function verfiyToken(
  token: string,
  tokenType: "access" | "refresh",
): Promise<JWTPayload> {
  if (!accessSecret || !refreshSecret) {
    throw new Error(
      `Secret of type: ${tokenType} is required for verifying token!`,
    );
  }

  const secret = createSecretKey(
    tokenType === "access" ? accessSecret : refreshSecret,
    "utf-8",
  );
  const { payload } = await jwtVerify(token, secret);
  return payload as JWTPayload;
}
