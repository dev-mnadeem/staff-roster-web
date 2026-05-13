"use client";

import { useTransition, type FunctionComponent } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

export type LogoutButtonProps = Record<string, never>;

export const LogoutButton: FunctionComponent<LogoutButtonProps> = () => {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
};
