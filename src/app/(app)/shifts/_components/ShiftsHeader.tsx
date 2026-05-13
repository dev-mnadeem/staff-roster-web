import Link from "next/link";
import { type FunctionComponent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/shared/routes";

export type ShiftsHeaderProps = {
  canManage: boolean;
};

export const ShiftsHeader: FunctionComponent<ShiftsHeaderProps> = ({
  canManage,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shifts</h1>
        <p className="text-muted-foreground text-sm">
          Drafts and published shifts across the schedule. Times shown in each
          location&apos;s timezone.
        </p>
      </div>
      {canManage ? (
        <Link
          href={ROUTES.newShift}
          className={buttonVariants({ variant: "default" })}
        >
          Add shift
        </Link>
      ) : null}
    </div>
  );
};
