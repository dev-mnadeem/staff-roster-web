"use client";

import { type FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAudit } from "@/hooks/audit";
import { AuditEntityType, type AuditEntry } from "@/types/audit";

export type ChangeHistoryProps = {
  shiftId: string;
};

export const ChangeHistory: FunctionComponent<ChangeHistoryProps> = ({
  shiftId,
}) => {
  const { data: shiftEntries } = useAudit({
    entityType: AuditEntityType.Shift,
    entityId: shiftId,
  });

  // Audit entries also live under the assignment entityType — for completeness
  // we'd merge those too, but the MVP shows shift-level changes only.
  const entries: AuditEntry[] = shiftEntries ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change history</CardTitle>
        <CardDescription>
          Every create, edit, publish, and unpublish action is logged.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No changes yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                {entry.actorId ? (
                  <div className="text-muted-foreground text-xs">
                    Actor: {entry.actorId.slice(0, 8)}…
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
