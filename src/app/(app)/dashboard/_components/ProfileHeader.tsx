import { type FunctionComponent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/shared/constants";

export type ProfileHeaderProps = {
  email?: string;
  displayName?: string;
  role: UserRole;
  desiredHoursPerWeek?: number;
  lastSignInAt?: string;
};

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Manager]: "Manager",
  [UserRole.Staff]: "Staff",
};

const ROLE_BLURB: Record<UserRole, string> = {
  [UserRole.Admin]: "Corporate oversight across every location.",
  [UserRole.Manager]: "You manage scheduling for your assigned locations.",
  [UserRole.Staff]: "View your schedule, set availability, and request swaps or drops.",
};

export const ProfileHeader: FunctionComponent<ProfileHeaderProps> = ({
  email,
  displayName,
  role,
  desiredHoursPerWeek,
  lastSignInAt,
}) => {
  const name = displayName ?? email ?? "Signed in";
  const initials = getInitials(displayName ?? email ?? "?");

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="bg-primary text-primary-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
          {initials}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            <Badge variant="secondary">{ROLE_LABEL[role]}</Badge>
          </div>
          {email && displayName ? (
            <p className="text-muted-foreground text-sm">{email}</p>
          ) : null}
          <p className="text-muted-foreground text-sm">{ROLE_BLURB[role]}</p>
          <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {typeof desiredHoursPerWeek === "number" ? (
              <span>Desired hours / week: {desiredHoursPerWeek}</span>
            ) : null}
            {lastSignInAt ? (
              <span>
                Last sign-in: {new Date(lastSignInAt).toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getInitials(input: string): string {
  const parts = input
    .replace(/[@.].*$/, "")
    .split(/[\s\-_]+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
