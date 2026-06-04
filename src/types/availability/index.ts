export type RecurringAvailability = {
  id: string;
  staffId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityException = {
  id: string;
  staffId: string;
  date: string;
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type Availability = {
  recurring: RecurringAvailability[];
  exceptions: AvailabilityException[];
};

export type CreateRecurringInput = {
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type CreateExceptionInput = {
  date: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  timezone: string;
};
