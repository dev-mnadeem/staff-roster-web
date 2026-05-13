import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCAL_TOKEN_COOKIE, isSupabaseConfigured } from "@/lib/auth/mode";
import { ROUTES } from "@/shared/routes";

const PROTECTED_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.locations,
  ROUTES.skills,
  ROUTES.team,
  ROUTES.shifts,
  ROUTES.availability,
  ROUTES.swaps,
  ROUTES.adminAudit,
  ROUTES.onDuty,
  ROUTES.analytics,
];
const AUTH_ROUTES = [ROUTES.login, ROUTES.signup];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_ROUTES.includes(pathname);

  // Self-hosted mode: presence of the token cookie is the signal. The token is
  // still verified on every API call, so this only decides which page to show
  // — it is routing, not authorisation.
  if (!isSupabaseConfigured()) {
    const hasToken = Boolean(request.cookies.get(LOCAL_TOKEN_COOKIE)?.value);

    if (!hasToken && isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.login;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (hasToken && isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.dashboard;
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
