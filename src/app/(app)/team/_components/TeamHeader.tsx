import { type FunctionComponent } from "react";

export const TeamHeader: FunctionComponent = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
      <p className="text-muted-foreground text-sm">
        Manage staff certifications, skills, and which locations each manager
        runs.
      </p>
    </div>
  );
};
