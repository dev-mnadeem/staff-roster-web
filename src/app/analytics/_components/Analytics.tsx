import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { FairnessChart } from "@/app/analytics/_components/FairnessChart";
import { OvertimeChart } from "@/app/analytics/_components/OvertimeChart";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const Analytics = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);
  const role = meResult.data.role;
  if (role !== UserRole.Admin && role !== UserRole.Manager) {
    redirect(ROUTES.dashboard);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Hours distribution, premium-shift fairness, and projected weekly
          overtime. Scoped to your managed locations.
        </p>
      </div>
      <OvertimeChart />
      <FairnessChart />
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
