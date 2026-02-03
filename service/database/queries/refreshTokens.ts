import { and, eq, gt, isNotNull, isNull, lte, or } from "drizzle-orm";
import { db } from "../db";
import { refreshTokens, type NewRefreshToken } from "../schema";

export async function insertRefreshToken(token: NewRefreshToken) {
  try {
    const [result] = await db.insert(refreshTokens).values(token).returning();
    return result;
  } catch (e) {
    console.log("error insert refresh", e);
  }
}

export async function getValidRefreshToken(
  userId: string,
  refreshToken: string,
) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.refreshToken, refreshToken),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    );

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

export async function revokeAllRefreshTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    );
}

export async function cleanupRefreshTokens() {
  const retention = new Date();
  retention.setDate(retention.getDate() - 7);

  await db
    .delete(refreshTokens)
    .where(
      or(
        and(
          isNotNull(refreshTokens.revokedAt),
          lte(refreshTokens.revokedAt, retention),
        ),
        lte(refreshTokens.expiresAt, retention),
      ),
    );
}
