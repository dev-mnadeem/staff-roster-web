"use client";

import { type FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOvertime } from "@/hooks/analytics";
import type { OvertimeProjectionRow } from "@/types/analytics";

export const OvertimeChart: FunctionComponent = () => {
  const { data, isLoading, error } = useOvertime();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projected weekly hours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </CardContent>
      </Card>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardContent className="text-destructive text-sm">
          {error?.message ?? "No data"}
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(40, ...data.rows.map((r) => r.weeklyHours));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected weekly hours</CardTitle>
        <CardDescription>
          Week of {data.weekStart} → {data.weekEnd}. Yellow ≥ 35h warning, red
          ≥ 60h soft block. Use this to see who's about to hit overtime.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No assignments this week.
          </p>
        ) : (
          data.rows.map((row) => (
            <Bar key={row.staffId} row={row} max={max} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

const Bar: FunctionComponent<{ row: OvertimeProjectionRow; max: number }> = ({
  row,
  max,
}) => {
  const pct = Math.max(2, Math.round((row.weeklyHours / max) * 100));
  const color =
    row.warningLevel === "block"
      ? "bg-destructive"
      : row.warningLevel === "warn"
        ? "bg-amber-500"
        : "bg-primary";
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-32 truncate">
        {row.displayName ?? row.staffId.slice(0, 8)}
      </div>
      <div className="bg-muted relative h-5 flex-1 rounded">
        <div
          className={`absolute left-0 top-0 h-full rounded ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-14 text-right tabular-nums">
        {row.weeklyHours.toFixed(1)}h
      </div>
    </div>
  );
};
