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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSetManagedLocations } from "@/hooks/team";
import type { Location } from "@/types/location";

export type ManagedLocationsFormProps = {
  managerId: string;
  allLocations: Location[];
  initialSelected: string[];
};

export const ManagedLocationsForm: FunctionComponent<
  ManagedLocationsFormProps
> = ({ managerId, allLocations, initialSelected }) => {
  const router = useRouter();
  const mutation = useSetManagedLocations(managerId);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(
      { locationIds: Array.from(selected) },
      {
        onSuccess: () => {
          toast.success("Managed locations updated");
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Managed locations</CardTitle>
        <CardDescription>
          Sites this manager runs. They will only see and edit shifts here.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          {allLocations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No locations defined yet.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allLocations.map((location) => (
                <Label
                  key={location.id}
                  htmlFor={`mgd-${location.id}`}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    id={`mgd-${location.id}`}
                    checked={selected.has(location.id)}
                    onCheckedChange={(checked) =>
                      toggle(location.id, checked === true)
                    }
                  />
                  <span>
                    {location.name}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({location.timezone})
                    </span>
                  </span>
                </Label>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending || allLocations.length === 0}
          >
            {mutation.isPending ? "Saving…" : "Save managed locations"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
