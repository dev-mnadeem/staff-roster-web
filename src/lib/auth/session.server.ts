import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LOCAL_TOKEN_COOKIE, isSupabaseConfigured } from "@/lib/auth/mode";
import { serverApiBaseUrl } from "@/lib/api/base-url";

/**
 * The bearer token for the current request, from whichever provider is active.
 *
 * Every server-side API call funnels through here, so switching providers is a
 * configuration change rather than a code change.
 */
export async function getAccessToken(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  const store = await cookies();
  return store.get(LOCAL_TOKEN_COOKIE)?.value ?? null;
}

export type SessionUser = { id: string; email?: string };

/**
 * The signed-in user, or null.
 *
 * Server components used to reach for the Supabase client directly, which made
 * them hard-fail when it was not configured. Reading the session through here
 * keeps them provider-agnostic.
 *
 * Under the self-hosted provider the token's claims are read without verifying
 * the signature. That is safe for this purpose: the value only decides what to
 * render, and every request the page makes is verified again by the API, which
 * holds the signing key. Nothing is authorised on the strength of this.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? { id: user.id, email: user.email ?? undefined } : null;
  }

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: string; email?: string; exp?: number };

    if (!claims.sub) return null;
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return { id: claims.sub, email: claims.email };
  } catch {
    return null;
  }
}

/** Exchanges credentials for a token via the API, and stores it. */
export async function signInLocal(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const base = serverApiBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the API. Is the backend running?" };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    return { error: body?.message ?? "Invalid email or password" };
  }

  const { accessToken } = (await response.json()) as { accessToken: string };
  const store = await cookies();
  store.set(LOCAL_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Matches the token's own lifetime so the cookie cannot outlive it.
    maxAge: 12 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return {};
}

export async function signOutLocal(): Promise<void> {
  const store = await cookies();
  store.delete(LOCAL_TOKEN_COOKIE);
}
