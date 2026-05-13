import Link from "next/link";
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
import { UserRole } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import type { TeamMember } from "@/types/team";

export type TeamListProps = {
  members: TeamMember[];
};

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Manager]: "Manager",
  [UserRole.Staff]: "Staff",
};

export const TeamList: FunctionComponent<TeamListProps> = ({ members }) => {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No team members yet</CardTitle>
          <CardDescription>
            People appear here after they sign up.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {members.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{member.displayName ?? member.email ?? member.id}</CardTitle>
                <CardDescription>
                  {member.email ?? "no email on file"}
                </CardDescription>
              </div>
              <Badge variant="secondary">{ROLE_LABEL[member.role]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-muted-foreground text-sm">
              {member.role === UserRole.Staff
                ? `${member.skills.length} skill${member.skills.length === 1 ? "" : "s"} · ${member.certifications.length} certified location${member.certifications.length === 1 ? "" : "s"}`
                : member.role === UserRole.Manager
                  ? `${member.managedLocations.length} location${member.managedLocations.length === 1 ? "" : "s"} managed`
                  : "Corporate oversight"}
            </div>
            <Link
              href={ROUTES.teamMember(member.id)}
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
              })}
            >
              Edit
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
