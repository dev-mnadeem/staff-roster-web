/**
 * Which identity provider the app is running against.
 *
 * Mirrors the backend's decision: configure Supabase and it is used; leave it
 * blank and the self-hosted provider takes over. Read from a NEXT_PUBLIC_
 * variable so the same answer is available in the browser and on the server.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Cookie holding the self-hosted access token. */
export const LOCAL_TOKEN_COOKIE = "shiftsync_token";
