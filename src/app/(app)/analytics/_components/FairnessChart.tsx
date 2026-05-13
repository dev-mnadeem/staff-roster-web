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
import { useFairness } from "@/hooks/analytics";
import type { StaffFairnessRow } from "@/types/analytics";

export const FairnessChart: FunctionComponent = () => {
  const { data, isLoading, error } = useFairness();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hours & premium-shift fairness</CardTitle>
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

  const maxHours = Math.max(1, ...data.rows.map((r) => r.totalHours));
  const maxPremium = Math.max(1, ...data.rows.map((r) => r.premiumShifts));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours & premium-shift fairness</CardTitle>
        <CardDescription>
          {fmtRange(data.from, data.to)}. Average premium shifts per staff:{" "}
          {data.premiumShiftsAverage.toFixed(1)}. Variance shows total hours
          minus desired (positive = over-scheduled, negative = under).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No staff in scope.</p>
        ) : (
          data.rows.map((row) => (
            <Row
              key={row.staffId}
              row={row}
              maxHours={maxHours}
              maxPremium={maxPremium}
              premiumAvg={data.premiumShiftsAverage}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

const Row: FunctionComponent<{
  row: StaffFairnessRow;
  maxHours: number;
  maxPremium: number;
  premiumAvg: number;
}> = ({ row, maxHours, maxPremium, premiumAvg }) => {
  const hoursPct = Math.max(2, Math.round((row.totalHours / maxHours) * 100));
  const premPct = Math.max(2, Math.round((row.premiumShifts / maxPremium) * 100));
  const premiumDelta = row.premiumShifts - premiumAvg;
  return (
    <div className="grid grid-cols-[8rem_1fr_4rem_1fr_4rem_5rem] items-center gap-2 text-sm">
      <div className="truncate">
        {row.displayName ?? row.staffId.slice(0, 8)}
      </div>
      <div className="bg-muted relative h-4 rounded">
        <div
          className="bg-primary absolute left-0 top-0 h-full rounded"
          style={{ width: `${hoursPct}%` }}
        />
      </div>
      <div className="text-right tabular-nums">
        {row.totalHours.toFixed(1)}h
      </div>
      <div className="bg-muted relative h-4 rounded">
        <div
          className="bg-amber-500 absolute left-0 top-0 h-full rounded"
          style={{ width: `${premPct}%` }}
        />
      </div>
      <div className="text-right tabular-nums">{row.premiumShifts}</div>
      <div className="text-right">
        {row.varianceVsDesired === null ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <Badge
            variant={
              row.varianceVsDesired > 0
                ? "destructive"
                : row.varianceVsDesired < -1
                  ? "secondary"
                  : "outline"
            }
          >
            {row.varianceVsDesired > 0 ? "+" : ""}
            {row.varianceVsDesired.toFixed(1)}h
          </Badge>
        )}
        {Math.abs(premiumDelta) >= 1.5 ? (
          <div className="text-muted-foreground mt-1 text-xs">
            premium {premiumDelta > 0 ? "+" : ""}
            {premiumDelta.toFixed(1)}
          </div>
        ) : null}
      </div>
    </div>
  );
};

function fmtRange(from: string, to: string): string {
  const f = new Date(from).toLocaleDateString();
  const t = new Date(to).toLocaleDateString();
  return `${f} → ${t}`;
}
