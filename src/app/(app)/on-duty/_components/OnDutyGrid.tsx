"use client";

import { type FunctionComponent } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOnDuty } from "@/hooks/on-duty";
import { formatInLocationTz } from "@/lib/time/format";
import type { OnDutyLocation } from "@/types/on-duty";

export const OnDutyGrid: FunctionComponent = () => {
  const { data, isLoading, error, dataUpdatedAt } = useOnDuty();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading on-duty…</p>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            No locations visible to you, or none have shifts in progress right
            now.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs">
        Last updated {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((location) => (
          <Card key={location.locationId}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  {location.locationName}
                </CardTitle>
                <Badge variant="outline">
                  {totalOnShift(location)} on shift
                </Badge>
              </div>
              <CardDescription>{location.locationTimezone}</CardDescription>
            </CardHeader>
            <CardContent>
              {location.shifts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nothing in progress.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {location.shifts.map((shift) => {
                    const tz = location.locationTimezone;
                    const start = formatInLocationTz(
                      shift.startAt,
                      tz,
                      "h:mm a",
                    );
                    const end = formatInLocationTz(
                      shift.endAt,
                      tz,
                      "h:mm a zzz",
                    );
                    return (
                      <li
                        key={shift.id}
                        className="rounded-md border p-2 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {shift.requiredSkillName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {start}–{end}
                          </span>
                        </div>
                        {shift.assignedStaff.length === 0 ? (
                          <p className="text-destructive text-xs">
                            No one assigned (target headcount {shift.headcount})
                          </p>
                        ) : (
                          <ul className="text-muted-foreground mt-1 text-xs">
                            {shift.assignedStaff.map((s) => (
                              <li key={s.id}>
                                {s.displayName ?? s.email ?? s.id.slice(0, 8)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function totalOnShift(location: OnDutyLocation): number {
  return location.shifts.reduce(
    (sum, shift) => sum + shift.assignedStaff.length,
    0,
  );
}
