import "server-only";

/**
 * Rewrites an API URL for use from the Next.js server process.
 *
 * The browser and the server do not necessarily reach the API at the same
 * address. Under Docker Compose the browser uses http://localhost:4000/api,
 * but inside the web container `localhost` is that container — the API is at
 * http://api:4000/api. `NEXT_PUBLIC_BACKEND_ENDPOINT` is baked into the client
 * bundle and so has to stay browser-facing, which leaves server-side callers
 * needing this translation.
 *
 * Only the origin is swapped, so every path in `shared/routes.ts` keeps working
 * untouched. With no internal override set this is the identity function, which
 * is the normal case outside containers.
 */
export function toServerApiUrl(url: string): string {
  const internal = process.env.API_BASE_URL_INTERNAL;
  if (!internal) return url;

  try {
    const target = new URL(internal);
    const original = new URL(url);
    original.protocol = target.protocol;
    original.host = target.host;
    return original.toString();
  } catch {
    return url;
  }
}

/** Base URL for server-side calls that are not built from `shared/routes`. */
export function serverApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL_INTERNAL ??
    process.env.NEXT_PUBLIC_BACKEND_ENDPOINT ??
    "http://localhost:4000/api"
  );
}
