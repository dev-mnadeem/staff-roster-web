export type ConstraintRule =
  | "not_certified"
  | "missing_skill"
  | "unavailable"
  | "double_booking"
  | "min_rest"
  | "daily_overtime_warn"
  | "daily_overtime_block"
  | "weekly_overtime_warn"
  | "consecutive_6_warn"
  | "consecutive_7_block";

export type ConstraintSeverity = "block" | "warn";

export type ConstraintViolation = {
  rule: ConstraintRule;
  severity: ConstraintSeverity;
  message: string;
};

export type DryRunResult = {
  allowed: boolean;
  blocking: ConstraintViolation[];
  warnings: ConstraintViolation[];
};

export type OvertimeOverride = {
  id: string;
  staffId: string;
  effectiveDate: string;
  reason: string;
  approvedById: string;
  createdAt: string;
};

export type CreateOverrideInput = {
  staffId: string;
  effectiveDate: string;
  reason: string;
};
