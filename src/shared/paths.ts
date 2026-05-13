/**
 * Whether `pathname` is `base` itself or a page beneath it.
 *
 * A bare `startsWith` would also match siblings that merely share a prefix,
 * so "/team" would claim "/teams" and "/teamwork".
 */
export function isWithin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}
