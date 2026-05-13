import type { UserRole } from "@/shared/constants";
import type { Location } from "@/types/location";
import type { Skill } from "@/types/skill";

export type TeamMember = {
  id: string;
  email?: string;
  role: UserRole;
  displayName?: string;
  desiredHoursPerWeek?: number;
  certifications: Location[];
  skills: Skill[];
  managedLocations: Location[];
};

export type SetCertificationsInput = {
  locationIds: string[];
};

export type SetSkillsInput = {
  skillIds: string[];
};

export type SetManagedLocationsInput = {
  locationIds: string[];
};
