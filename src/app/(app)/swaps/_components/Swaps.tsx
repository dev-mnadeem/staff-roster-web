import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SwapsInbox } from "@/app/(app)/swaps/_components/SwapsInbox";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const Swaps = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);
  const role = meResult.data.role;
  const canApprove = role === UserRole.Admin || role === UserRole.Manager;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Swaps & drops
          </h1>
          <p className="text-muted-foreground text-sm">
            {canApprove
              ? "Manager view: approve or reject pending requests, alongside your own."
              : "Track requests you've initiated and ones waiting on your acceptance."}
          </p>
        </div>
        <Link
          href={ROUTES.openShifts}
          className={buttonVariants({ variant: "secondary" })}
        >
          Open shifts
        </Link>
      </div>
      <SwapsInbox canApprove={canApprove} />
    </div>
  );
};
