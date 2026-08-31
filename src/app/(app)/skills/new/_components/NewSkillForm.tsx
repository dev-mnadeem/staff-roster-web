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
import { useCreateSkill } from "@/hooks/skills";
import { ROUTES } from "@/shared/routes";

export type NewSkillFormProps = Record<string, never>;

export const NewSkillForm: FunctionComponent<NewSkillFormProps> = () => {
  const router = useRouter();
  const mutation = useCreateSkill();
  const [name, setName] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(
      { name: name.trim() },
      {
        onSuccess: (created) => {
          toast.success(`${created.name} created`);
          router.push(ROUTES.skills);
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
        <CardTitle>Add a skill</CardTitle>
        <CardDescription>
          Admin-only. Skill names are normalized to lowercase and must be
          unique.
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
              maxLength={50}
              placeholder="bartender"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.skills)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Create skill"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
