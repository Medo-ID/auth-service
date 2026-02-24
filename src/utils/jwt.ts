import { jwtVerify, SignJWT } from "jose";
import { createSecretKey } from "node:crypto";

export interface JWTPayload {
  sub: string;
  email: string;
  username: string;
  [key: string]: unknown;
}

const accessSecret = process.env.ACCESS_SECRET;
const refreshSecret = process.env.REFRESH_SECRET;

const accessExp = process.env.ACCESS_EXP;
const refreshExp = process.env.REFRESH_EXP;

export async function generateTokens(payload: JWTPayload, audience: string[]) {
  if (!accessSecret) {
    throw new Error("Access secret is required to generate access token!");
  }

  const accessKey = createSecretKey(accessSecret, "utf-8");
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer("auth-service")
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(accessExp || "2m")
    .sign(accessKey);

  if (!refreshSecret) {
    throw new Error("Refresh secret is required to generate refresh token!");
  }

  const refreshKey = createSecretKey(refreshSecret, "utf-8");
  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer("auth-service")
    .setAudience("auth-service")
    .setIssuedAt()
    .setExpirationTime(refreshExp || "7d")
    .sign(refreshKey);

  return { accessToken, refreshToken };
}

export async function verifyToken(
  token: string,
  tokenType: "access" | "refresh",
  audience?: string,
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
  const { payload } = await jwtVerify(token, secret, {
    issuer: "auth-service",
    audience: tokenType === "access" ? audience : "auth-service",
  });

  return payload as JWTPayload;
}

export function refreshTokenExpiry() {
  const day = new Date();
  day.setDate(day.getDate() + 7);
  return day;
}
