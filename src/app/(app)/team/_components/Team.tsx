import { redirect } from "next/navigation";
import { TeamHeader } from "@/app/(app)/team/_components/TeamHeader";
import { TeamList } from "@/app/(app)/team/_components/TeamList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { TeamMember } from "@/types/team";

export const Team = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);

  if (!meResult.ok || meResult.data.role !== UserRole.Admin) {
    redirect(ROUTES.dashboard);
  }

  const teamResult = await apiFetch<TeamMember[]>(APIS.team.list);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <TeamHeader />
      {teamResult.ok ? (
        <TeamList members={teamResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load team ({teamResult.status || "network"}):{" "}
          {teamResult.error}
        </p>
      )}
    </div>
  );
};
