import type { BunRequest } from "bun";
import type { NewUser } from "../database/schema";
import { createUser, getUserByEmail } from "../database/queries/users";
import { hashPassword } from "../utils/hash";
import { respondWithJSON } from "../utils/json";
import { UserForbiddenError } from "../utils/error";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validation";

export async function register(req: BunRequest) {
  const body = (await req.json()) as NewUser;
  const email = validateEmail(body.email);
  const username = validateUsername(body.username);
  const password = validatePassword(body.password);

  const userExists = await getUserByEmail(email);
  if (userExists) {
    throw new UserForbiddenError("User already exists!");
  }

  const hashedPassword = await hashPassword(password);
  await createUser({ email, username, password: hashedPassword });

  return respondWithJSON(201, {
    message: "Registred Successfully. You can login!",
  });
}
