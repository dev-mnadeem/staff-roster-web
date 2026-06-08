"use client";

import { useMemo, useState, type FunctionComponent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAudit } from "@/hooks/audit";
import { APIS } from "@/shared/routes";
import { AuditEntityType, type ListAuditParams } from "@/types/audit";

const ENTITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All entities" },
  { value: AuditEntityType.Shift, label: "Shifts" },
  { value: AuditEntityType.ShiftAssignment, label: "Assignments" },
  { value: AuditEntityType.SwapRequest, label: "Swaps" },
  { value: AuditEntityType.OvertimeOverride, label: "Overtime overrides" },
];

export const AuditViewer: FunctionComponent = () => {
  const [entityType, setEntityType] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo<ListAuditParams>(() => {
    const p: ListAuditParams = {};
    if (entityType) p.entityType = entityType as AuditEntityType;
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    return p;
  }, [entityType, from, to]);

  const { data, isLoading, error } = useAudit(params);

  const onExport = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      toast.error("No active session");
      return;
    }
    try {
      const response = await fetch(
        APIS.audit.exportCsv({
          entityType: params.entityType,
          from: params.from,
          to: params.to,
        }),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        toast.error(`Export failed (${response.status})`);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shiftsync-audit.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Export failed",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div className="grid gap-1">
            <Label htmlFor="entity-type">Entity</Label>
            <select
              id="entity-type"
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {ENTITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="datetime-local"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="datetime-local"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <Button type="button" onClick={onExport}>
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error.message}</p>
        ) : !data || data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No audit entries match these filters.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{entry.entityType}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="font-medium">{entry.action}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {entry.entityId.slice(0, 8)}…
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                {entry.actorId ? (
                  <div className="text-muted-foreground text-xs">
                    Actor {entry.actorId.slice(0, 8)}…
                    {entry.locationId
                      ? ` · location ${entry.locationId.slice(0, 8)}…`
                      : null}
                  </div>
                ) : null}
                {entry.before || entry.after ? (
                  <details className="mt-1">
                    <summary className="text-muted-foreground cursor-pointer text-xs">
                      Diff
                    </summary>
                    <pre className="bg-muted/30 mt-1 overflow-x-auto rounded p-2 text-xs">
                      {JSON.stringify(
                        { before: entry.before, after: entry.after },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
