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
import { useCreateShift } from "@/hooks/shifts";
import { localInputToUtcIso } from "@/lib/time/format";
import { ROUTES } from "@/shared/routes";
import type { Location } from "@/types/location";
import type { Skill } from "@/types/skill";

export type NewShiftFormProps = {
  locations: Location[];
  skills: Skill[];
};

export const NewShiftForm: FunctionComponent<NewShiftFormProps> = ({
  locations,
  skills,
}) => {
  const router = useRouter();
  const mutation = useCreateShift();
  const [locationId, setLocationId] = useState<string>(
    locations[0]?.id ?? "",
  );
  const [skillId, setSkillId] = useState<string>(skills[0]?.id ?? "");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [headcount, setHeadcount] = useState(1);

  const selectedLocation = locations.find((l) => l.id === locationId);
  const tz = selectedLocation?.timezone ?? "UTC";

  const blocked = locations.length === 0 || skills.length === 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!locationId || !skillId || !startLocal || !endLocal) return;

    const startAt = localInputToUtcIso(startLocal, tz);
    const endAt = localInputToUtcIso(endLocal, tz);

    mutation.mutate(
      {
        locationId,
        requiredSkillId: skillId,
        startAt,
        endAt,
        headcount,
      },
      {
        onSuccess: () => {
          toast.success("Shift created");
          router.push(ROUTES.shifts);
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Add a shift</CardTitle>
        <CardDescription>
          Drafts are private until you publish them. Times are interpreted in
          the selected location&apos;s timezone.
        </CardDescription>
      </CardHeader>
      {blocked ? (
        <CardContent>
          <p className="text-muted-foreground text-sm">
            You need at least one location and one skill before creating a
            shift.
          </p>
        </CardContent>
      ) : (
        <form onSubmit={onSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <select
                id="location"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                required
                className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.timezone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill">Required skill</Label>
              <select
                id="skill"
                value={skillId}
                onChange={(event) => setSkillId(event.target.value)}
                required
                className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start">Start (in {tz})</Label>
              <Input
                id="start"
                type="datetime-local"
                value={startLocal}
                onChange={(event) => setStartLocal(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end">End (in {tz})</Label>
              <Input
                id="end"
                type="datetime-local"
                value={endLocal}
                onChange={(event) => setEndLocal(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                type="number"
                min={1}
                max={50}
                value={headcount}
                onChange={(event) => setHeadcount(Number(event.target.value))}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.shifts)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Create shift"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};
