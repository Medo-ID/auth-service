import type { HeadersInit } from "bun";

export function respondWithJSON(
  status: number,
  payload: any,
  headers: HeadersInit = {},
) {
  const body = JSON.stringify(payload);

  const responseHeaders = new Headers({
    "Content-Type": "application/json",
    ...headers,
  });

  return new Response(body, {
    status,
    headers: responseHeaders,
  });
}
