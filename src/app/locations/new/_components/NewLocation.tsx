import { redirect } from "next/navigation";
import { NewLocationForm } from "@/app/locations/new/_components/NewLocationForm";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const NewLocation = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);

  if (!meResult.ok || meResult.data.role !== UserRole.Admin) {
    redirect(ROUTES.locations);
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <NewLocationForm />
    </div>
  );
};
