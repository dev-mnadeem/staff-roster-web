import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { AppNav } from "@/components/shell/AppNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserRole } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

type Props = {
  userId: string;
  role: UserRole;
  displayName?: string;
  email?: string;
  children: React.ReactNode;
};

/**
 * Persistent frame around every signed-in page.
 *
 * Each screen previously ended in a "Back to dashboard" link, so moving between
 * sections meant a round trip through the overview. A standing sidebar makes
 * the whole product visible at once and turns two clicks into one.
 */
export function AppShell({
  userId,
  role,
  displayName,
  email,
  children,
}: Props) {
  const initials = (displayName ?? email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-4 w-1 rounded-full bg-foreground"
            />
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              ShiftSync
            </span>
          </Link>

          <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
            Coastal Eats
          </span>

          <div className="ml-auto flex items-center gap-3">
            <NotificationBell userId={userId} />
            <div className="hidden items-center gap-2 sm:flex">
              <span
                aria-hidden
                className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background"
              >
                {initials}
              </span>
              <span className="text-sm text-muted-foreground">
                {displayName ?? email}
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Collapses on small screens rather than shrinking: a cramped sidebar
            competing with a schedule table serves neither. */}
        <aside className="hidden w-56 shrink-0 border-r border-border px-3 py-6 lg:block">
          <AppNav role={role} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          {/* Horizontal scroller on mobile, where the sidebar is hidden. */}
          <div className="mb-6 -mx-4 overflow-x-auto px-4 lg:hidden">
            <div className="min-w-max">
              <AppNav role={role} />
            </div>
          </div>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
