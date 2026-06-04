export type Skill = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSkillInput = {
  name: string;
};

export type UpdateSkillInput = Partial<CreateSkillInput>;
