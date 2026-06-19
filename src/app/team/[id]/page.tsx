import type { NextPage } from "next";
import { TeamMember } from "@/app/team/[id]/_components";

type TeamMemberPageProps = {
  params: Promise<{ id: string }>;
};

const TeamMemberPage: NextPage<TeamMemberPageProps> = async ({ params }) => {
  const { id } = await params;
  return <TeamMember id={id} />;
};

export default TeamMemberPage;
