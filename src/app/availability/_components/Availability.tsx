import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AvailabilityEditor } from "@/app/availability/_components/AvailabilityEditor";
import { apiFetch } from "@/lib/api/server";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const Availability = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My availability
        </h1>
        <p className="text-muted-foreground text-sm">
          Set the recurring weekly windows when you can work, plus one-off
          exceptions for specific dates. Times are stored in your home
          timezone.
        </p>
      </div>
      <AvailabilityEditor />
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
