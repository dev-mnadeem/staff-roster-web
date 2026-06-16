import { redirect } from "next/navigation";
import { NewSkillForm } from "@/app/skills/new/_components/NewSkillForm";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const NewSkill = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);

  if (!meResult.ok || meResult.data.role !== UserRole.Admin) {
    redirect(ROUTES.skills);
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <NewSkillForm />
    </div>
  );
};
