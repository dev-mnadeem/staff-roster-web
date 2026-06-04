export type Location = {
  id: string;
  name: string;
  timezone: string;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLocationInput = {
  name: string;
  timezone: string;
  address?: string;
};

export type UpdateLocationInput = Partial<CreateLocationInput>;
