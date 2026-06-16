import Link from "next/link";
import { type FunctionComponent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/shared/routes";

export type SkillsHeaderProps = {
  canCreate: boolean;
};

export const SkillsHeader: FunctionComponent<SkillsHeaderProps> = ({
  canCreate,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="text-muted-foreground text-sm">
          Roles staff can fill (server, bartender, line cook, host, …).
        </p>
      </div>
      {canCreate ? (
        <Link
          href={ROUTES.newSkill}
          className={buttonVariants({ variant: "default" })}
        >
          Add skill
        </Link>
      ) : null}
    </div>
  );
};
