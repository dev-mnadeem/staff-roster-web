import Link from "next/link";
import { redirect } from "next/navigation";
import { type FunctionComponent } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CertificationsForm } from "@/app/team/[id]/_components/CertificationsForm";
import { ManagedLocationsForm } from "@/app/team/[id]/_components/ManagedLocationsForm";
import { SkillsForm } from "@/app/team/[id]/_components/SkillsForm";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Location } from "@/types/location";
import type { Skill } from "@/types/skill";
import type { TeamMember as TeamMemberType } from "@/types/team";

export type TeamMemberProps = {
  id: string;
};

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Manager]: "Manager",
  [UserRole.Staff]: "Staff",
};

export const TeamMember: FunctionComponent<TeamMemberProps> = async ({
  id,
}) => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok || meResult.data.role !== UserRole.Admin) {
    redirect(ROUTES.dashboard);
  }

  const [memberResult, locationsResult, skillsResult] = await Promise.all([
    apiFetch<TeamMemberType>(APIS.team.detail(id)),
    apiFetch<Location[]>(APIS.locations.list),
    apiFetch<Skill[]>(APIS.skills.list),
  ]);

  if (!memberResult.ok) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <p className="text-destructive text-sm">
          Could not load member ({memberResult.status || "network"}):{" "}
          {memberResult.error}
        </p>
        <BackLink />
      </div>
    );
  }

  const member = memberResult.data;
  const locations = locationsResult.ok ? locationsResult.data : [];
  const skills = skillsResult.ok ? skillsResult.data : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>
                {member.displayName ?? member.email ?? member.id}
              </CardTitle>
              <CardDescription>
                {member.email ?? "no email on file"}
              </CardDescription>
            </div>
            <Badge variant="secondary">{ROLE_LABEL[member.role]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {member.desiredHoursPerWeek
            ? `Desired hours per week: ${member.desiredHoursPerWeek}`
            : "No desired-hours preference set"}
        </CardContent>
      </Card>

      {member.role === UserRole.Staff ? (
        <>
          <SkillsForm
            staffId={member.id}
            allSkills={skills}
            initialSelected={member.skills.map((s) => s.id)}
          />
          <CertificationsForm
            staffId={member.id}
            allLocations={locations}
            initialSelected={member.certifications.map((l) => l.id)}
          />
        </>
      ) : null}

      {member.role === UserRole.Manager ? (
        <ManagedLocationsForm
          managerId={member.id}
          allLocations={locations}
          initialSelected={member.managedLocations.map((l) => l.id)}
        />
      ) : null}

      {member.role === UserRole.Admin ? (
        <Card>
          <CardHeader>
            <CardTitle>Corporate oversight</CardTitle>
            <CardDescription>
              Admins are not bound to specific locations or skills.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <BackLink />
    </div>
  );
};

const BackLink: FunctionComponent = () => (
  <div>
    <Link
      href={ROUTES.team}
      className={buttonVariants({ variant: "link", className: "px-0" })}
    >
      ← Back to team
    </Link>
  </div>
);
