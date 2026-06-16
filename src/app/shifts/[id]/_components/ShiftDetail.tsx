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
import { AssignmentsPanel } from "@/app/shifts/[id]/_components/AssignmentsPanel";
import { ChangeHistory } from "@/app/shifts/[id]/_components/ChangeHistory";
import { apiFetch } from "@/lib/api/server";
import { formatInLocationTz } from "@/lib/time/format";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { TeamMember } from "@/types/team";
import { ShiftStatus, type Shift } from "@/types/shift";

export type ShiftDetailProps = {
  id: string;
};

export const ShiftDetail: FunctionComponent<ShiftDetailProps> = async ({
  id,
}) => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);
  const role = meResult.data.role;
  const canManage = role === UserRole.Admin || role === UserRole.Manager;

  const [shiftResult, teamResult] = await Promise.all([
    apiFetch<Shift>(APIS.shifts.detail(id)),
    canManage
      ? apiFetch<TeamMember[]>(APIS.team.list)
      : Promise.resolve({ ok: false, status: 403, error: "" } as const),
  ]);

  if (!shiftResult.ok) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-6">
        <p className="text-destructive text-sm">
          Could not load shift ({shiftResult.status || "network"}):{" "}
          {shiftResult.error}
        </p>
        <BackLink />
      </div>
    );
  }
  const shift = shiftResult.data;
  const tz = shift.location?.timezone ?? "UTC";

  const allStaff =
    teamResult.ok && Array.isArray(teamResult.data)
      ? teamResult.data.filter((m) => m.role === UserRole.Staff)
      : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>
                {shift.location?.name ?? "—"} ·{" "}
                {shift.requiredSkill?.name ?? "—"}
              </CardTitle>
              <CardDescription>
                {formatInLocationTz(shift.startAt, tz)} →{" "}
                {formatInLocationTz(shift.endAt, tz, "h:mm a zzz")}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Badge
                variant={
                  shift.status === ShiftStatus.Published
                    ? "default"
                    : "outline"
                }
              >
                {shift.status}
              </Badge>
              {shift.isPremium ? (
                <Badge variant="secondary">premium</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Headcount target: {shift.headcount}
        </CardContent>
      </Card>

      <AssignmentsPanel
        shiftId={shift.id}
        shiftStartAt={shift.startAt}
        shiftLocationTimezone={tz}
        canManage={canManage}
        currentUserId={meResult.data.id}
        allStaff={allStaff}
        requiredSkillId={shift.requiredSkillId}
        locationId={shift.locationId}
      />

      {canManage ? <ChangeHistory shiftId={shift.id} /> : null}

      <BackLink />
    </div>
  );
};

const BackLink: FunctionComponent = () => (
  <div>
    <Link
      href={ROUTES.shifts}
      className={buttonVariants({ variant: "link", className: "px-0" })}
    >
      ← Back to shifts
    </Link>
  </div>
);
