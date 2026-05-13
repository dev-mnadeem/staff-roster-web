import type { UserRole } from "@/shared/constants";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  desiredHoursPerWeek?: number;
};
