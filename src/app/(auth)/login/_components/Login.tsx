import { type FunctionComponent } from "react";
import { AuthForm } from "@/app/(auth)/_components";
import { login } from "@/app/(auth)/actions";
import { AuthMode } from "@/shared/constants";

export type LoginProps = {
  next?: string;
};

export const Login: FunctionComponent<LoginProps> = ({ next }) => {
  return <AuthForm mode={AuthMode.Login} action={login} next={next} />;
};
