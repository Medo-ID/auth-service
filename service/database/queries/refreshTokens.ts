import { eq } from "drizzle-orm";
import { db } from "../db";
import { refreshTokens, type NewRefreshToken } from "../schema";

export async function insertRefreshToken(token: NewRefreshToken) {
  const [result] = await db.insert(refreshTokens).values(token).returning();
  return result?.id;
}

export async function getRefreshTokenByUserId(userId: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.userId, userId));

  return result;
}

export async function revokeRefreshToken(id: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, id))
    .returning({ id: refreshTokens.id });

  return result;
}

export async function expireRefreshToken(id: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({ expiresAt: new Date() })
    .where(eq(refreshTokens.id, id))
    .returning({ id: refreshTokens.id });

  return result;
}
