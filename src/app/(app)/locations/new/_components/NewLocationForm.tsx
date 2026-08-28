"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type FunctionComponent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLocation } from "@/hooks/locations";
import { ROUTES } from "@/shared/routes";

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

export type NewLocationFormProps = Record<string, never>;

export const NewLocationForm: FunctionComponent<NewLocationFormProps> = () => {
  const router = useRouter();
  const mutation = useCreateLocation();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState<string>(TIMEZONE_OPTIONS[0]);
  const [address, setAddress] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(
      {
        name: name.trim(),
        timezone,
        address: address.trim() || undefined,
      },
      {
        onSuccess: (created) => {
          toast.success(`${created.name} created`);
          router.push(ROUTES.locations);
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add a location</CardTitle>
        <CardDescription>
          Admin-only. The timezone determines how shifts at this location are
          displayed and how recurring availability is interpreted.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="Coastal Eats — Brooklyn"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              required
              className="border-input bg-transparent file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              maxLength={500}
              placeholder="123 Ocean Ave, Brooklyn NY"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.locations)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Create location"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
