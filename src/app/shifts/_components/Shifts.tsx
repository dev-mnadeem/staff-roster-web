import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ShiftsHeader } from "@/app/shifts/_components/ShiftsHeader";
import { ShiftsList } from "@/app/shifts/_components/ShiftsList";
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      <ShiftsHeader canManage={canManage} />
      <ShiftsList locations={locations} canManage={canManage} />
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
