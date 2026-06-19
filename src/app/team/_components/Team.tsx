import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { TeamHeader } from "@/app/team/_components/TeamHeader";
import { TeamList } from "@/app/team/_components/TeamList";
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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <TeamHeader />
      {teamResult.ok ? (
        <TeamList members={teamResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load team ({teamResult.status || "network"}):{" "}
          {teamResult.error}
        </p>
      )}
      <div>
        <Link
          href={ROUTES.dashboard}
          className={buttonVariants({ variant: "link", className: "px-0" })}
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
};
