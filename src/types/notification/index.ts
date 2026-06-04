export enum NotificationType {
  ShiftAssigned = "shift_assigned",
  ShiftUnassigned = "shift_unassigned",
  ShiftPublished = "shift_published",
  ShiftEdited = "shift_edited",
  SwapRequested = "swap_requested",
  SwapAccepted = "swap_accepted",
  SwapApproved = "swap_approved",
  SwapRejected = "swap_rejected",
  SwapCancelled = "swap_cancelled",
  SwapExpired = "swap_expired",
  OvertimeWarning = "overtime_warning",
  AvailabilityChanged = "availability_changed",
}

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown> | null;
  emailSimulated: boolean;
  readAt?: string | null;
  createdAt: string;
};

export type UnreadCount = {
  count: number;
};
