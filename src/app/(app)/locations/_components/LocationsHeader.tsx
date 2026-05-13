import Link from "next/link";
import { type FunctionComponent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/shared/routes";

export type LocationsHeaderProps = {
  canCreate: boolean;
};

export const LocationsHeader: FunctionComponent<LocationsHeaderProps> = ({
  canCreate,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
        <p className="text-muted-foreground text-sm">
          Coastal Eats sites where shifts are scheduled.
        </p>
      </div>
      {canCreate ? (
        <Link
          href={ROUTES.newLocation}
          className={buttonVariants({ variant: "default" })}
        >
          Add location
        </Link>
      ) : null}
    </div>
  );
};
