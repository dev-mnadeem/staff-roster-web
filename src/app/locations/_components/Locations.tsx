import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LocationsHeader } from "@/app/locations/_components/LocationsHeader";
import { LocationsList } from "@/app/locations/_components/LocationsList";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <LocationsHeader canCreate={canCreate} />
      {locationsResult.ok ? (
        <LocationsList locations={locationsResult.data} />
      ) : (
        <p className="text-destructive text-sm">
          Could not load locations ({locationsResult.status || "network"}):{" "}
          {locationsResult.error}
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
