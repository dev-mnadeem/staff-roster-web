import { redirect } from "next/navigation";
import { AuditViewer } from "@/app/(app)/admin/audit/_components/AuditViewer";
import { apiFetch } from "@/lib/api/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const AdminAudit = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);
  if (meResult.data.role !== UserRole.Admin) redirect(ROUTES.dashboard);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-muted-foreground text-sm">
          Every change to shifts, assignments, swaps, and overrides is logged.
          Filter and export to CSV.
        </p>
      </div>
      <AuditViewer />
    </div>
  );
};
