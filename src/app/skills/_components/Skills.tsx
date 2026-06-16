import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SkillsHeader } from "@/app/skills/_components/SkillsHeader";
import { SkillsList } from "@/app/skills/_components/SkillsList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Skill } from "@/types/skill";

export const Skills = async () => {
  const [meResult, skillsResult] = await Promise.all([
    apiFetch<CurrentUser>(APIS.auth.me),
    apiFetch<Skill[]>(APIS.skills.list),
  ]);

  const canCreate = meResult.ok && meResult.data.role === UserRole.Admin;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <SkillsHeader canCreate={canCreate} />
      {skillsResult.ok ? (
        <SkillsList skills={skillsResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load skills ({skillsResult.status || "network"}):{" "}
          {skillsResult.error}
        </p>
      )}
      <div>
        <Link
          href={ROUTES.dashboard}
          className={buttonVariants({ variant: "link", className: "px-0" })}
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
};
