"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/mode";
import { signInLocal, signOutLocal } from "@/lib/auth/session.server";
import { ROUTES } from "@/shared/routes";
import type { AuthFormState } from "@/types/auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function login(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: error.message };
  } else {
    const { error } = await signInLocal(parsed.data.email, parsed.data.password);
    if (error) return { error };
  }

  const next = (formData.get("next") as string) || ROUTES.dashboard;
  redirect(next);
}

export async function signup(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  if (!isSupabaseConfigured()) {
    // Self-hosted accounts are created by the seed, not by public signup —
    // this is a staffing tool, not a product anyone can join.
    return {
      error:
        "Self-signup is disabled in local mode. Sign in with a seeded account " +
        "(see the README) or configure Supabase.",
    };
  }

  const supabase = await createClient();
  const origin = (formData.get("origin") as string) || "";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}${ROUTES.authCallback}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect(ROUTES.dashboard);
  }

  return {
    message: "Check your email for a confirmation link to finish signing up.",
  };
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    await signOutLocal();
  }
  redirect(ROUTES.login);
}
