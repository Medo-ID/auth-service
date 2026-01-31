import type { BunRequest } from "bun";
import type { NewUser } from "../database/schema";
import { createUser, getUserByEmail } from "../database/queries/users";
import { hashPassword } from "../utils/hash";
import { respondWithJSON } from "../utils/json";

export async function register(req: BunRequest) {
  const { email, username, password } = (await req.json()) as NewUser;
  if (!email || !username || !password) {
    return new Error("");
  }

  const userExists = await getUserByEmail(email);
  if (userExists) {
    return new Error("");
  }

  const hashedPassword = await hashPassword(password);
  const user = await createUser({ email, username, password: hashedPassword });
  if (!user) {
    return new Error("");
  }

  return respondWithJSON(201, user);
}
