import { redirect } from "next/navigation";
import { Planner } from "@/app/(app)/planner/_components/Planner";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export default async function PlannerPage() {
  // Planning writes nothing, but it exposes the whole roster, so it is scoped
  // the same way the schedule itself is.
  const me = await apiFetch<CurrentUser>(APIS.auth.me);
  const role = me.ok ? me.data.role : UserRole.Staff;
  if (role !== UserRole.Admin && role !== UserRole.Manager) {
    redirect(ROUTES.dashboard);
  }
  return <Planner />;
}
