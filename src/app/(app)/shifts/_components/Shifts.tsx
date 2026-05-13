import { redirect } from "next/navigation";
import { ShiftsHeader } from "@/app/(app)/shifts/_components/ShiftsHeader";
import { ShiftsList } from "@/app/(app)/shifts/_components/ShiftsList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Location } from "@/types/location";

export const Shifts = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);

  const role = meResult.data.role;
  const locationsResult = await apiFetch<Location[]>(APIS.locations.list);
  const locations = locationsResult.ok ? locationsResult.data : [];

  const canManage = role === UserRole.Admin || role === UserRole.Manager;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ShiftsHeader canManage={canManage} />
      <ShiftsList locations={locations} canManage={canManage} />
    </div>
  );
};
