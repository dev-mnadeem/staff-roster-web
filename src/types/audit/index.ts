export enum AuditEntityType {
  Shift = "shift",
  ShiftAssignment = "shift_assignment",
  SwapRequest = "swap_request",
  OvertimeOverride = "overtime_override",
}

export enum AuditAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
  Publish = "publish",
  Unpublish = "unpublish",
  Assign = "assign",
  Unassign = "unassign",
  SwapCreate = "swap_create",
  SwapAccept = "swap_accept",
  SwapApprove = "swap_approve",
  SwapReject = "swap_reject",
  SwapCancel = "swap_cancel",
  OverrideGrant = "override_grant",
  OverrideRevoke = "override_revoke",
}

export type AuditEntry = {
  id: string;
  actorId?: string | null;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
  locationId?: string | null;
  createdAt: string;
};

export type ListAuditParams = {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  actorId?: string;
  locationId?: string;
  from?: string;
  to?: string;
};

export type Suggestion = {
  staffId: string;
  displayName: string | null;
  weeklyHours: number;
};
