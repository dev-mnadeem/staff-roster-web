import { type FunctionComponent } from "react";
import { AuthForm } from "@/app/(auth)/_components";
import { signup } from "@/app/(auth)/actions";
import { AuthMode } from "@/shared/constants";

export type SignupProps = Record<string, never>;

export const Signup: FunctionComponent<SignupProps> = () => {
  return <AuthForm mode={AuthMode.Signup} action={signup} />;
};
