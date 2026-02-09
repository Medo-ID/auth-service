import type { BunRequest } from "bun";

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
  domain?: string;
  maxAge?: number;
};

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.path) cookie += `; Path=${options.path ?? "/"}`;
  if (options.httpOnly) cookie += `; HttpOnly`;
  if (options.secure) cookie += `; Secure`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

  return cookie;
}

export function parseCookies(req: BunRequest): Record<string, string> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [key, ...v] = cookie.split("=");
      return [key, decodeURIComponent(v.join("="))];
    }),
  );
}

export const cookies: CookieOptions = {
  httpOnly: true,
  secure: process.env.ENV === "production",
  sameSite: "Lax",
  path: process.env.ENV === "production" ? "/auth" : "/",
  maxAge: 60 * 60 * 24 * 7,
};
