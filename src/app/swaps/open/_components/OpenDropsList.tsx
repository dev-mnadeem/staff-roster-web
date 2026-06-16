"use client";

import { type FunctionComponent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOpenDrops, useSwapAction } from "@/hooks/swaps";
import { formatInLocationTz } from "@/lib/time/format";

export const OpenDropsList: FunctionComponent = () => {
  const { data, isLoading, error } = useOpenDrops();
  const claim = useSwapAction("claim");

  const onClaim = (id: string) => {
    claim.mutate(
      { id },
      {
        onSuccess: () =>
          toast.success("Claim submitted — awaiting manager approval"),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading open shifts…</p>
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
            No open drop requests right now that match your skills.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {data.map((swap) => {
        const tz = swap.shiftLocationTimezone ?? "UTC";
        const start = formatInLocationTz(swap.shiftStartAt, tz);
        const end = formatInLocationTz(swap.shiftEndAt, tz, "h:mm a zzz");
        return (
          <Card key={swap.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {swap.shiftLocationName ?? "Shift"}
                  </CardTitle>
                  <CardDescription>
                    {start} → {end}
                  </CardDescription>
                </div>
                <Badge variant="outline">drop</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">
                Dropped by{" "}
                {swap.requesterDisplayName ?? swap.requesterId.slice(0, 8)}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => onClaim(swap.id)}
                disabled={claim.isPending}
              >
                {claim.isPending ? "Claiming…" : "Claim"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
