import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session.server";
import { isSupabaseConfigured } from "@/lib/auth/mode";

/**
 * Hands the current access token to same-origin browser code.
 *
 * Under the self-hosted provider the token lives in an httpOnly cookie, which
 * client components cannot read — deliberately, so that a script injected into
 * the page cannot lift it straight out of `document.cookie`. This route is the
 * one controlled way back out, and it exists only in that mode: with Supabase
 * configured its SDK already manages the browser session.
 */
export async function GET() {
  if (isSupabaseConfigured()) {
    return NextResponse.json({ token: null });
  }
  return NextResponse.json(
    { token: await getAccessToken() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
