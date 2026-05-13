import { redirect } from "next/navigation";
import { OnDutyGrid } from "@/app/(app)/on-duty/_components/OnDutyGrid";
import { apiFetch } from "@/lib/api/server";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const OnDuty = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">On duty now</h1>
        <p className="text-muted-foreground text-sm">
          Live view of who is currently working at each location. Refreshes
          every 30 seconds.
        </p>
      </div>
      <OnDutyGrid />
    </div>
  );
};
