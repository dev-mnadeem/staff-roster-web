import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth/mode";

let cached: { token: string | null; fetchedAt: number } | null = null;
const CACHE_MS = 30_000;

/**
 * The bearer token for browser-side API calls.
 *
 * With Supabase the SDK holds the session. Self-hosted, the token is in an
 * httpOnly cookie, so it is read back through a same-origin route and cached
 * briefly — without the cache every request would cost an extra round-trip.
 */
export async function getClientAccessToken(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.token;
  }

  try {
    const response = await fetch("/api/auth/token", { cache: "no-store" });
    const { token } = (await response.json()) as { token: string | null };
    cached = { token, fetchedAt: Date.now() };
    return token;
  } catch {
    return null;
  }
}

/** Drops the cached token, e.g. after signing out. */
export function clearClientAccessToken(): void {
  cached = null;
}
