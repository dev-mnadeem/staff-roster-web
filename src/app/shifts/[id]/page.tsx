import type { NextPage } from "next";
import { ShiftDetail } from "@/app/shifts/[id]/_components";

type ShiftDetailPageProps = {
  params: Promise<{ id: string }>;
};

const ShiftDetailPage: NextPage<ShiftDetailPageProps> = async ({ params }) => {
  const { id } = await params;
  return <ShiftDetail id={id} />;
};

export default ShiftDetailPage;
