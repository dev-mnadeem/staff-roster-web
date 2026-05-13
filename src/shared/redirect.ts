import { ROUTES } from "@/shared/routes";

/**
 * The `next` value from a query string or form, if it is a path on this site.
 *
 * `next` comes from the URL, so anyone can craft a sign-in link that carries
 * one. Following it blindly turns the login page into an open redirect:
 * `?next=https://evil.example` or `?next=//evil.example` would hand a freshly
 * signed-in user to another origin. Only a single-slash absolute path is kept.
 */
export function safeNextPath(
  value: unknown,
  fallback: string = ROUTES.dashboard,
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  // Browsers treat a backslash like a slash, so "/\evil.example" is
  // protocol-relative too. Control characters have no place in a path.
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
