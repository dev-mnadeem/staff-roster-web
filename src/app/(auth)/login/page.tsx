import { Login } from "@/app/(auth)/login/_components";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

const LoginPage = async ({ searchParams }: Props) => {
  const { next } = await searchParams;
  return <Login next={next} />;
};

export default LoginPage;
