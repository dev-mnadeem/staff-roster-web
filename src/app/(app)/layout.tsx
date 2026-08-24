import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { apiFetch } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session.server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

/**
 * Layout for every signed-in route.
 *
 * The profile is fetched once here rather than in each page, so the shell can
 * show who is signed in and hide navigation the current role cannot use.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);

  const me = await apiFetch<CurrentUser>(APIS.auth.me);
  const role = me.ok ? me.data.role : UserRole.Staff;

  return (
    <AppShell
      userId={user.id}
      role={role}
      displayName={me.ok ? me.data.displayName : undefined}
      email={me.ok ? me.data.email : user.email}
    >
      {children}
    </AppShell>
  );
}
