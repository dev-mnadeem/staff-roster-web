"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClientFetch } from "@/lib/api/client";
import { APIS } from "@/shared/routes";
import type { RosterPlan } from "@/types/planner";

const PLANNING_HORIZON_DAYS = 14;

/**
 * From today to two weeks out.
 *
 * A calendar-week default looks tidier but plans the wrong thing: gaps in the
 * next few days are the urgent ones, and anchoring to next Monday skips
 * straight past them.
 */
function defaultRange(): { from: string; to: string } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + PLANNING_HORIZON_DAYS);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function Planner() {
  const [range] = useState(defaultRange);
  const [plan, setPlan] = useState<RosterPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      setPlan(
        await apiClientFetch<RosterPlan>(APIS.planner.plan, {
          method: "POST",
          body: JSON.stringify({ from: range.from, to: range.to }),
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not build a plan",
      );
    } finally {
      setLoading(false);
    }
  };

  const day = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Auto-fill the roster
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Proposes people for every open slot between {day(range.from)} and{" "}
            {day(range.to)}, preferring whoever has worked fewest hours. Nothing
            is saved — review the reasoning, then assign the ones you want.
          </p>
        </div>
        <Button onClick={run} disabled={loading}>
          {loading ? "Planning…" : "Build a plan"}
        </Button>
      </header>

      {plan && (
        <>
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Summary</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {plan.explanation.source === "model"
                  ? "written by model"
                  : "computed"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {plan.explanation.summary}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
              {[
                {
                  label: "Coverage",
                  value: `${Math.round(plan.metrics.coverage * 100)}%`,
                },
                {
                  label: "Slots filled",
                  value: `${plan.metrics.slotsFilled}/${plan.metrics.slotsTotal}`,
                },
                {
                  label: "Newly assigned",
                  value: String(plan.assignments.length),
                },
                {
                  label: "Hours spread",
                  value: `${plan.metrics.hoursSpreadBefore.toFixed(1)} → ${plan.metrics.hoursSpreadAfter.toFixed(1)}h`,
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-card p-3">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {plan.assignments.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">Proposed assignments</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {plan.assignments.map((a, i) => (
                  <li key={`${a.shiftId}-${a.staffId}-${i}`} className="p-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-medium">{a.staffName}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {a.weeklyHoursBefore}h that week
                      </span>
                    </div>
                    {/* The reason is the point of the feature: a manager has to
                        be able to defend the roster to whoever got the late
                        shift. */}
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {a.reason}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.unfilled.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">
                Still open ({plan.unfilled.length})
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {plan.unfilled.map((u) => (
                  <li key={u.shiftId} className="p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">
                        {u.shiftLabel}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {u.remaining} slot{u.remaining === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {u.blockers
                        .map((b) => `${b.staffCount} ${b.reason}`)
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {!plan && !loading && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No plan yet. Build one to see who the scheduler would put where, and
          why.
        </p>
      )}
    </div>
  );
}
