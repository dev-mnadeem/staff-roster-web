export type ShiftAssignment = {
  id: string;
  shiftId: string;
  staffId: string;
  staffDisplayName?: string | null;
  staffEmail?: string;
  assignedById: string;
  assignedAt: string;
};

export type CreateAssignmentInput = {
  staffId: string;
};
