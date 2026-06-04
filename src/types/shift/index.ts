import type { Location } from "@/types/location";
import type { Skill } from "@/types/skill";

export enum ShiftStatus {
  Draft = "draft",
  Published = "published",
}

export type Shift = {
  id: string;
  locationId: string;
  startAt: string;
  endAt: string;
  requiredSkillId: string;
  headcount: number;
  isPremium: boolean;
  status: ShiftStatus;
  publishedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  location?: Location;
  requiredSkill?: Skill;
};

export type CreateShiftInput = {
  locationId: string;
  startAt: string;
  endAt: string;
  requiredSkillId: string;
  headcount: number;
};

export type UpdateShiftInput = Partial<Omit<CreateShiftInput, never>> & {
  version: number;
};

export type ListShiftsParams = {
  locationId?: string;
  from?: string;
  to?: string;
};
