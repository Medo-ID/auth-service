import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser } from "../schema";

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));
  return result;
}

export async function createUser(newUser: NewUser) {
  const [result] = await db.insert(users).values(newUser).returning();
  return {
    id: result?.id,
    email: result?.email,
    username: result?.username,
    createdAt: result?.createdAt,
    updatedAt: result?.updatedAt,
  };
}
