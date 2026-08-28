import { SkillsHeader } from "@/app/(app)/skills/_components/SkillsHeader";
import { SkillsList } from "@/app/(app)/skills/_components/SkillsList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Skill } from "@/types/skill";

export const Skills = async () => {
  const [meResult, skillsResult] = await Promise.all([
    apiFetch<CurrentUser>(APIS.auth.me),
    apiFetch<Skill[]>(APIS.skills.list),
  ]);

  const canCreate = meResult.ok && meResult.data.role === UserRole.Admin;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SkillsHeader canCreate={canCreate} />
      {skillsResult.ok ? (
        <SkillsList skills={skillsResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load skills ({skillsResult.status || "network"}):{" "}
          {skillsResult.error}
        </p>
      )}
    </div>
  );
};
