"use client";

import { useMemo, useState, type FunctionComponent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  useAssignStaff,
  useAssignmentDryRun,
  useShiftAssignments,
  useSuggestions,
  useUnassignStaff,
} from "@/hooks/assignments";
import { useGrantOverride } from "@/hooks/overtime";
import { useCreateSwap } from "@/hooks/swaps";
import type { TeamMember } from "@/types/team";
import type { ConstraintViolation } from "@/types/overtime";
import { SwapType } from "@/types/swap";

export type AssignmentsPanelProps = {
  shiftId: string;
  shiftStartAt: string;
  shiftLocationTimezone: string;
  canManage: boolean;
  currentUserId: string;
  allStaff: TeamMember[];
  requiredSkillId: string;
  locationId: string;
};

export const AssignmentsPanel: FunctionComponent<AssignmentsPanelProps> = ({
  shiftId,
  shiftStartAt,
  shiftLocationTimezone,
  canManage,
  currentUserId,
  allStaff,
  requiredSkillId,
  locationId,
}) => {
  const { data: assignments, isLoading, error } = useShiftAssignments(shiftId);
  const assign = useAssignStaff(shiftId);
  const unassign = useUnassignStaff(shiftId);
  const createSwap = useCreateSwap();

  const assignedIds = useMemo(
    () => new Set((assignments ?? []).map((a) => a.staffId)),
    [assignments],
  );

  const staffOptions = useMemo(() => {
    return allStaff
      .filter((staff) => !assignedIds.has(staff.id))
      .map((staff) => {
        const hasSkill = staff.skills.some((s) => s.id === requiredSkillId);
        const certified = staff.certifications.some(
          (l) => l.id === locationId,
        );
        return {
          staff,
          eligible: hasSkill && certified,
          missing: [
            !hasSkill ? "skill" : null,
            !certified ? "certification" : null,
          ].filter(Boolean) as string[],
        };
      })
      .sort((a, b) => Number(b.eligible) - Number(a.eligible));
  }, [allStaff, assignedIds, requiredSkillId, locationId]);

  const [selectedStaffId, setSelectedStaffId] = useState("");

  const onAssign = () => {
    if (!selectedStaffId) return;
    assign.mutate(
      { staffId: selectedStaffId },
      {
        onSuccess: () => {
          toast.success("Staff assigned");
          setSelectedStaffId("");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const onUnassign = (staffId: string) => {
    unassign.mutate(staffId, {
      onSuccess: () => toast.success("Staff unassigned"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned staff</CardTitle>
        <CardDescription>
          The constraint engine validates skills, certifications, availability,
          double-booking, minimum rest, and overtime before saving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error.message}</p>
        ) : !assignments || assignments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No one assigned yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {a.staffDisplayName ?? a.staffEmail ?? a.staffId}
                  </div>
                  {a.staffEmail ? (
                    <div className="text-muted-foreground text-xs">
                      {a.staffEmail}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  {a.staffId === currentUserId ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        createSwap.mutate(
                          {
                            type: SwapType.Drop,
                            requestingAssignmentId: a.id,
                          },
                          {
                            onSuccess: () =>
                              toast.success("Drop request submitted"),
                            onError: (e) => toast.error(e.message),
                          },
                        )
                      }
                      disabled={createSwap.isPending}
                    >
                      Request drop
                    </Button>
                  ) : null}
                  {canManage ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onUnassign(a.staffId)}
                      disabled={unassign.isPending}
                    >
                      Unassign
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {canManage ? (
        <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
          <div className="grid gap-2">
            <Label htmlFor="staff-picker">Assign a staff member</Label>
            <select
              id="staff-picker"
              value={selectedStaffId}
              onChange={(event) => setSelectedStaffId(event.target.value)}
              className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Choose a staff member…</option>
              {staffOptions.map(({ staff, eligible, missing }) => (
                <option key={staff.id} value={staff.id}>
                  {staff.displayName ?? staff.email ?? staff.id}
                  {eligible ? "" : ` — missing ${missing.join(", ")}`}
                </option>
              ))}
            </select>
          </div>

          {selectedStaffId ? (
            <DryRunPanel
              shiftId={shiftId}
              shiftStartAt={shiftStartAt}
              shiftLocationTimezone={shiftLocationTimezone}
              staffId={selectedStaffId}
            />
          ) : (
            <SuggestionsPanel
              shiftId={shiftId}
              onPick={(staffId) => setSelectedStaffId(staffId)}
            />
          )}

          <div className="flex justify-end">
            <AssignButton
              shiftId={shiftId}
              staffId={selectedStaffId}
              onAssign={onAssign}
              isPending={assign.isPending}
            />
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
};

type SuggestionsPanelProps = {
  shiftId: string;
  onPick: (staffId: string) => void;
};

const SuggestionsPanel: FunctionComponent<SuggestionsPanelProps> = ({
  shiftId,
  onPick,
}) => {
  const { data, isLoading, error } = useSuggestions(shiftId, true);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Finding qualified staff…
      </p>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="mb-2 text-sm font-medium">
        Suggested (lowest weekly hours, all constraints clear)
      </div>
      <ul className="flex flex-col gap-1">
        {data.map((s) => (
          <li
            key={s.staffId}
            className="flex items-center justify-between text-sm"
          >
            <span>
              {s.displayName ?? s.staffId.slice(0, 8)}
              <span className="text-muted-foreground ml-2 text-xs">
                {s.weeklyHours.toFixed(1)}h this week
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPick(s.staffId)}
            >
              Pick
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

type AssignButtonProps = {
  shiftId: string;
  staffId: string;
  onAssign: () => void;
  isPending: boolean;
};

const AssignButton: FunctionComponent<AssignButtonProps> = ({
  shiftId,
  staffId,
  onAssign,
  isPending,
}) => {
  const { data: dryRun } = useAssignmentDryRun(shiftId, staffId);
  const blocked = !!dryRun && !dryRun.allowed;
  return (
    <Button
      type="button"
      onClick={onAssign}
      disabled={!staffId || isPending || blocked}
    >
      {isPending ? "Assigning…" : "Assign"}
    </Button>
  );
};

type DryRunPanelProps = {
  shiftId: string;
  shiftStartAt: string;
  shiftLocationTimezone: string;
  staffId: string;
};

const DryRunPanel: FunctionComponent<DryRunPanelProps> = ({
  shiftId,
  shiftStartAt,
  shiftLocationTimezone,
  staffId,
}) => {
  const { data, isLoading, error } = useAssignmentDryRun(shiftId, staffId);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Checking constraints…
      </p>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }
  if (!data) return null;

  if (data.blocking.length === 0 && data.warnings.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        ✓ All constraints clear.
      </div>
    );
  }

  const consecutive7 = data.blocking.find(
    (v) => v.rule === "consecutive_7_block",
  );

  return (
    <div className="flex flex-col gap-2">
      {data.blocking.map((v) => (
        <ViolationRow key={`${v.rule}-${v.message}`} violation={v} />
      ))}
      {data.warnings.map((v) => (
        <ViolationRow key={`${v.rule}-${v.message}`} violation={v} />
      ))}
      {consecutive7 ? (
        <GrantOverrideForm
          staffId={staffId}
          shiftStartAt={shiftStartAt}
          shiftLocationTimezone={shiftLocationTimezone}
        />
      ) : null}
    </div>
  );
};

const ViolationRow: FunctionComponent<{ violation: ConstraintViolation }> = ({
  violation,
}) => {
  const blocking = violation.severity === "block";
  return (
    <div
      className={
        "flex items-start gap-2 rounded-md border p-2 text-sm " +
        (blocking
          ? "border-destructive/40 bg-destructive/5"
          : "border-amber-500/40 bg-amber-50")
      }
    >
      <Badge variant={blocking ? "destructive" : "secondary"}>
        {blocking ? "block" : "warn"}
      </Badge>
      <span>{violation.message}</span>
    </div>
  );
};

type GrantOverrideFormProps = {
  staffId: string;
  shiftStartAt: string;
  shiftLocationTimezone: string;
};

const GrantOverrideForm: FunctionComponent<GrantOverrideFormProps> = ({
  staffId,
  shiftStartAt,
  shiftLocationTimezone,
}) => {
  const grant = useGrantOverride();
  const [reason, setReason] = useState("");

  const effectiveDate = formatLocalDate(shiftStartAt, shiftLocationTimezone);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    grant.mutate(
      { staffId, effectiveDate, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Override granted");
          setReason("");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3"
    >
      <div className="text-sm font-medium">
        Grant 7th-day override for {effectiveDate}
      </div>
      <Label htmlFor="override-reason" className="text-xs font-normal">
        Reason (required, ≥ 5 chars)
      </Label>
      <textarea
        id="override-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        minLength={5}
        maxLength={500}
        required
        className="border-input bg-background min-h-16 rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        placeholder="e.g. Sick coverage for Sarah; staff agreed."
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={grant.isPending || reason.trim().length < 5}
        >
          {grant.isPending ? "Granting…" : "Grant override"}
        </Button>
      </div>
    </form>
  );
};

function formatLocalDate(utcIso: string, tz: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(utcIso));
}
