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
import { useSetSkills } from "@/hooks/team";
import type { Skill } from "@/types/skill";

export type SkillsFormProps = {
  staffId: string;
  allSkills: Skill[];
  initialSelected: string[];
};

export const SkillsForm: FunctionComponent<SkillsFormProps> = ({
  staffId,
  allSkills,
  initialSelected,
}) => {
  const router = useRouter();
  const mutation = useSetSkills(staffId);
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
      { skillIds: Array.from(selected) },
      {
        onSuccess: () => {
          toast.success("Skills updated");
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
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          What this staff member is qualified to do.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          {allSkills.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No skills defined yet. Add some on the Skills page first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allSkills.map((skill) => (
                <Label
                  key={skill.id}
                  htmlFor={`skill-${skill.id}`}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    id={`skill-${skill.id}`}
                    checked={selected.has(skill.id)}
                    onCheckedChange={(checked) =>
                      toggle(skill.id, checked === true)
                    }
                  />
                  <span>{skill.name}</span>
                </Label>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending || allSkills.length === 0}
          >
            {mutation.isPending ? "Saving…" : "Save skills"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
