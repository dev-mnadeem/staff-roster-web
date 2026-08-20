export type PlannedAssignment = {
  shiftId: string;
  staffId: string;
  staffName: string;
  reason: string;
  weeklyHoursBefore: number;
  premiumShiftsBefore: number;
};

export type UnfilledSlot = {
  shiftId: string;
  shiftLabel: string;
  remaining: number;
  blockers: Array<{ reason: string; staffCount: number }>;
};

export type RosterPlan = {
  from: string;
  to: string;
  locationIds: string[];
  assignments: PlannedAssignment[];
  unfilled: UnfilledSlot[];
  metrics: {
    slotsTotal: number;
    slotsFilled: number;
    coverage: number;
    hoursSpreadBefore: number;
    hoursSpreadAfter: number;
  };
  explanation: { summary: string; source: "model" | "rules" };
};
