import { type FunctionComponent } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Skill } from "@/types/skill";

export type SkillsListProps = {
  skills: Skill[];
};

export const SkillsList: FunctionComponent<SkillsListProps> = ({ skills }) => {
  if (skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No skills yet</CardTitle>
          <CardDescription>
            An admin can add the first skill to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <Card key={skill.id}>
          <CardHeader>
            <CardTitle className="capitalize">{skill.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
