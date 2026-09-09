import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session.server";
import { ROUTES } from "@/shared/routes";

export default async function Home() {
  const user = await getSessionUser();
  redirect(user ? ROUTES.dashboard : ROUTES.login);
}
