"use client";

import Link from "next/link";
import { useState, type FunctionComponent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  usePublishShift,
  useShifts,
  useUnpublishShift,
} from "@/hooks/shifts";
import { formatInLocationTz } from "@/lib/time/format";
import { ROUTES } from "@/shared/routes";
import type { Location } from "@/types/location";
import { ShiftStatus, type Shift } from "@/types/shift";

export type ShiftsListProps = {
  locations: Location[];
  canManage: boolean;
};

export const ShiftsList: FunctionComponent<ShiftsListProps> = ({
  locations,
  canManage,
}) => {
  const [locationId, setLocationId] = useState<string>("");
  const params = locationId ? { locationId } : {};
  const { data: shifts, isLoading, error } = useShifts(params);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="location-filter">Location</Label>
          <select
            id="location-filter"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            className="border-input bg-transparent file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.timezone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading shifts…</p>
      ) : error ? (
        <p className="text-destructive text-sm">{error.message}</p>
      ) : !shifts || shifts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No shifts</CardTitle>
            <CardDescription>
              {locationId
                ? "No shifts at this location yet."
                : "No shifts created yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type ShiftCardProps = {
  shift: Shift;
  canManage: boolean;
};

const ShiftCard: FunctionComponent<ShiftCardProps> = ({ shift, canManage }) => {
  const publish = usePublishShift();
  const unpublish = useUnpublishShift();
  const tz = shift.location?.timezone ?? "UTC";
  const start = formatInLocationTz(shift.startAt, tz);
  const end = formatInLocationTz(shift.endAt, tz, "h:mm a zzz");

  const onPublish = () => {
    publish.mutate(
      { id: shift.id, version: shift.version },
      {
        onSuccess: () => toast.success("Shift published"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const onUnpublish = () => {
    unpublish.mutate(
      { id: shift.id, version: shift.version },
      {
        onSuccess: () => toast.success("Shift moved to draft"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const pending = publish.isPending || unpublish.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {shift.location?.name ?? "—"} · {shift.requiredSkill?.name ?? "—"}
            </CardTitle>
            <CardDescription>
              {start} → {end}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Badge
              variant={
                shift.status === ShiftStatus.Published ? "default" : "outline"
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
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Headcount {shift.headcount}
        </p>
        <div className="flex gap-2">
          <Link
            href={ROUTES.shiftDetail(shift.id)}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Open
          </Link>
          {canManage ? (
            shift.status === ShiftStatus.Draft ? (
              <Button size="sm" onClick={onPublish} disabled={pending}>
                {publish.isPending ? "Publishing…" : "Publish"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={onUnpublish}
                disabled={pending}
              >
                {unpublish.isPending ? "Unpublishing…" : "Unpublish"}
              </Button>
            )
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
