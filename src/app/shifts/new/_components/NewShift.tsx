import { redirect } from "next/navigation";
import { NewShiftForm } from "@/app/shifts/new/_components/NewShiftForm";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Location } from "@/types/location";
import type { Skill } from "@/types/skill";

export const NewShift = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);

  const role = meResult.data.role;
  if (role !== UserRole.Admin && role !== UserRole.Manager) {
    redirect(ROUTES.shifts);
  }

  const [locationsResult, skillsResult] = await Promise.all([
    apiFetch<Location[]>(APIS.locations.list),
    apiFetch<Skill[]>(APIS.skills.list),
  ]);

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <NewShiftForm
        locations={locationsResult.ok ? locationsResult.data : []}
        skills={skillsResult.ok ? skillsResult.data : []}
      />
    </div>
  );
};
