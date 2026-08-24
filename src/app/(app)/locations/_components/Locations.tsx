import { LocationsHeader } from "@/app/(app)/locations/_components/LocationsHeader";
import { LocationsList } from "@/app/(app)/locations/_components/LocationsList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";
import type { Location } from "@/types/location";

export const Locations = async () => {
  const [meResult, locationsResult] = await Promise.all([
    apiFetch<CurrentUser>(APIS.auth.me),
    apiFetch<Location[]>(APIS.locations.list),
  ]);

  const canCreate =
    meResult.ok && meResult.data.role === UserRole.Admin;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <LocationsHeader canCreate={canCreate} />
      {locationsResult.ok ? (
        <LocationsList locations={locationsResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load locations ({locationsResult.status || "network"}):{" "}
          {locationsResult.error}
        </p>
      )}
    </div>
  );
};
