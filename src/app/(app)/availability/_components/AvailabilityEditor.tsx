"use client";

import { useState, type FormEvent, type FunctionComponent } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateException,
  useCreateRecurring,
  useDeleteException,
  useDeleteRecurring,
  useMyAvailability,
} from "@/hooks/availability";

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Stockholm",
  "Asia/Karachi",
  "UTC",
] as const;

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const guessBrowserTz = () => {
  if (typeof Intl !== "undefined") {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }
  return "UTC";
};

export const AvailabilityEditor: FunctionComponent = () => {
  const browserTz = guessBrowserTz();
  const defaultTz = TIMEZONE_OPTIONS.includes(
    browserTz as (typeof TIMEZONE_OPTIONS)[number],
  )
    ? browserTz
    : TIMEZONE_OPTIONS[0];
  const [tz, setTz] = useState<string>(defaultTz);
  const { data, isLoading, error } = useMyAvailability();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading availability…</p>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Home timezone</CardTitle>
          <CardDescription>
            New windows you add use this timezone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="tz">Timezone</Label>
            <select
              id="tz"
              value={tz}
              onChange={(event) => setTz(event.target.value)}
              className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <RecurringSection
        recurring={data?.recurring ?? []}
        timezone={tz}
      />

      <ExceptionsSection
        exceptions={data?.exceptions ?? []}
        timezone={tz}
      />
    </div>
  );
};

type RecurringSectionProps = {
  recurring: NonNullable<
    ReturnType<typeof useMyAvailability>["data"]
  >["recurring"];
  timezone: string;
};

const RecurringSection: FunctionComponent<RecurringSectionProps> = ({
  recurring,
  timezone,
}) => {
  const create = useCreateRecurring();
  const remove = useDeleteRecurring();
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate(
      { weekday, startTime, endTime, timezone },
      {
        onSuccess: () => toast.success("Window added"),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const onDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast.success("Window removed"),
      onError: (e) => toast.error(e.message),
    });
  };

  const grouped = WEEKDAY_LABELS.map((label, day) => ({
    day,
    label,
    windows: recurring.filter((r) => r.weekday === day),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring weekly schedule</CardTitle>
        <CardDescription>
          Windows when you&apos;re generally available. Multiple windows per
          day are allowed for split shifts.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 md:grid-cols-2">
          {grouped.map(({ day, label, windows }) => (
            <div key={day} className="rounded-md border p-3">
              <div className="mb-2 text-sm font-medium">{label}</div>
              {windows.length === 0 ? (
                <p className="text-muted-foreground text-xs">No windows</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {windows.map((w) => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {w.startTime}–{w.endTime}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({w.timezone})
                        </span>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(w.id)}
                        disabled={remove.isPending}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={onAdd}
          className="grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <div className="grid gap-1">
            <Label htmlFor="weekday">Day</Label>
            <select
              id="weekday"
              value={weekday}
              onChange={(event) => setWeekday(Number(event.target.value))}
              className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {WEEKDAY_LABELS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add window"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

type ExceptionsSectionProps = {
  exceptions: NonNullable<
    ReturnType<typeof useMyAvailability>["data"]
  >["exceptions"];
  timezone: string;
};

const ExceptionsSection: FunctionComponent<ExceptionsSectionProps> = ({
  exceptions,
  timezone,
}) => {
  const create = useCreateException();
  const remove = useDeleteException();
  const [date, setDate] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasTimes, setHasTimes] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date) return;
    create.mutate(
      {
        date,
        isAvailable,
        startTime: hasTimes ? startTime : undefined,
        endTime: hasTimes ? endTime : undefined,
        timezone,
      },
      {
        onSuccess: () => toast.success("Exception added"),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const onDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast.success("Exception removed"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exceptions</CardTitle>
        <CardDescription>
          One-off overrides for specific dates. Use this for vacation days,
          extra availability on a normally-off day, or partial blackouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {exceptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No exceptions yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {exceptions.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ex.isAvailable ? "default" : "destructive"}
                  >
                    {ex.isAvailable ? "available" : "blackout"}
                  </Badge>
                  <span className="font-medium">{ex.date}</span>
                  <span className="text-muted-foreground">
                    {ex.startTime && ex.endTime
                      ? `${ex.startTime}–${ex.endTime}`
                      : "whole day"}
                    <span className="ml-1 text-xs">({ex.timezone})</span>
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(ex.id)}
                  disabled={remove.isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={onAdd}
          className="grid gap-3 rounded-md border bg-muted/30 p-3"
        >
          <div className="grid gap-3 md:grid-cols-2 md:items-end">
            <div className="grid gap-1">
              <Label htmlFor="exception-date">Date</Label>
              <Input
                id="exception-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <Label
              htmlFor="is-available"
              className="flex items-center gap-2 font-normal"
            >
              <Checkbox
                id="is-available"
                checked={isAvailable}
                onCheckedChange={(checked) =>
                  setIsAvailable(checked === true)
                }
              />
              <span>Treat this as extra availability (off by default)</span>
            </Label>
          </div>
          <Label
            htmlFor="has-times"
            className="flex items-center gap-2 font-normal"
          >
            <Checkbox
              id="has-times"
              checked={hasTimes}
              onCheckedChange={(checked) => setHasTimes(checked === true)}
            />
            <span>Limit to specific hours (otherwise whole day)</span>
          </Label>
          {hasTimes ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="ex-start">Start</Label>
                <Input
                  id="ex-start"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="ex-end">End</Label>
                <Input
                  id="ex-end"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </div>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding…" : "Add exception"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
