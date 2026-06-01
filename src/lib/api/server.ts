import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error:
        error instanceof Error
          ? `Network error: ${error.message}`
          : "Network error",
    };
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // body wasn't JSON; keep the raw text
    }
    return { ok: false, status: response.status, error: message };
  }

  const data = (await response.json()) as T;
  return { ok: true, data };
}
