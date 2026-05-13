"use client";

import Link from "next/link";
import { useActionState, useEffect, type FunctionComponent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthMode } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import type { AuthAction, AuthFormState } from "@/types/auth";

export type AuthFormProps = {
  mode: AuthMode;
  action: AuthAction;
  next?: string;
};

const COPY = {
  [AuthMode.Login]: {
    title: "Welcome back",
    description: "Sign in to your ShiftSync account.",
    submit: "Sign in",
    pendingSubmit: "Signing in…",
    altPrompt: "Don't have an account?",
    altLabel: "Create one",
    altHref: ROUTES.signup,
  },
  [AuthMode.Signup]: {
    title: "Create your account",
    description: "Get started with ShiftSync.",
    submit: "Sign up",
    pendingSubmit: "Creating account…",
    altPrompt: "Already have an account?",
    altLabel: "Sign in",
    altHref: ROUTES.login,
  },
} as const;

export const AuthForm: FunctionComponent<AuthFormProps> = ({
  mode,
  action,
  next,
}) => {
  const copy = COPY[mode];
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.message) toast.success(state.message);
  }, [state]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <input
            type="hidden"
            name="origin"
            value={
              typeof window === "undefined" ? "" : window.location.origin
            }
          />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state?.fieldErrors?.email)}
            />
            {state?.fieldErrors?.email ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.email[0]}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === AuthMode.Login ? "current-password" : "new-password"
              }
              required
              minLength={mode === AuthMode.Signup ? 8 : undefined}
              aria-invalid={Boolean(state?.fieldErrors?.password)}
            />
            {state?.fieldErrors?.password ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.password[0]}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? copy.pendingSubmit : copy.submit}
          </Button>
          <p className="text-muted-foreground text-sm">
            {copy.altPrompt}{" "}
            <Link
              href={copy.altHref}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {copy.altLabel}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
