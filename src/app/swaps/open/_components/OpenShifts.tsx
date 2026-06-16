import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { OpenDropsList } from "@/app/swaps/open/_components/OpenDropsList";
import { apiFetch } from "@/lib/api/server";
import { APIS, ROUTES } from "@/shared/routes";
import type { CurrentUser } from "@/types/auth";

export const OpenShifts = async () => {
  const meResult = await apiFetch<CurrentUser>(APIS.auth.me);
  if (!meResult.ok) redirect(ROUTES.login);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Open shifts</h1>
        <p className="text-muted-foreground text-sm">
          Drop requests from coworkers that match your skills and certifications.
          Claiming a shift sends it to a manager for approval.
        </p>
      </div>
      <OpenDropsList />
      <div>
        <Link
          href={ROUTES.swaps}
          className={buttonVariants({ variant: "link", className: "px-0" })}
        >
          ← Back to swap inbox
        </Link>
      </div>
    </div>
  );
};
