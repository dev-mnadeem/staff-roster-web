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
import { useSetCertifications } from "@/hooks/team";
import type { Location } from "@/types/location";

export type CertificationsFormProps = {
  staffId: string;
  allLocations: Location[];
  initialSelected: string[];
};

export const CertificationsForm: FunctionComponent<CertificationsFormProps> = ({
  staffId,
  allLocations,
  initialSelected,
}) => {
  const router = useRouter();
  const mutation = useSetCertifications(staffId);
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
          toast.success("Certifications updated");
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
        <CardTitle>Location certifications</CardTitle>
        <CardDescription>
          Locations this staff member is allowed to work at.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          {allLocations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No locations defined yet. Add some on the Locations page first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allLocations.map((location) => (
                <Label
                  key={location.id}
                  htmlFor={`cert-${location.id}`}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    id={`cert-${location.id}`}
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
            {mutation.isPending ? "Saving…" : "Save certifications"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
