import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/dashboard/_components/LogoutButton";
import { ProfileHeader } from "@/app/dashboard/_components/ProfileHeader";
import { DashboardLinks } from "@/app/dashboard/_components/DashboardLinks";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationChannelToggle } from "@/components/notifications/NotificationChannelToggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/shared/constants";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const Dashboard = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.login);

  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  const role = meResult.ok ? meResult.data.role : UserRole.Staff;
  const displayName = meResult.ok ? meResult.data.displayName : undefined;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <ProfileHeader
          email={user.email}
          displayName={displayName}
          role={role}
          desiredHoursPerWeek={
            meResult.ok ? meResult.data.desiredHoursPerWeek : undefined
          }
          lastSignInAt={meResult.ok ? meResult.data.lastSignInAt : undefined}
        />
        <NotificationBell userId={user.id} />
      </div>

      {!meResult.ok ? (
        <Card>
          <CardContent className="text-destructive p-4 text-sm">
            Could not reach the ShiftSync API ({meResult.status || "network"}):{" "}
            {meResult.error}
          </CardContent>
        </Card>
      ) : (
        <DashboardLinks role={role} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <NotificationChannelToggle />
          <div className="border-t pt-3">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
