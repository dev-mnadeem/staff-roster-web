export enum SwapType {
  Swap = "swap",
  Drop = "drop",
}

export enum SwapStatus {
  Pending = "pending",
  AcceptedByPeer = "accepted_by_peer",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
  Expired = "expired",
}

export type SwapRequest = {
  id: string;
  type: SwapType;
  status: SwapStatus;
  requestingAssignmentId: string;
  requesterId: string;
  requesterDisplayName?: string | null;
  targetStaffId?: string | null;
  targetStaffDisplayName?: string | null;
  targetAssignmentId?: string | null;
  expiresAt?: string | null;
  decidedById?: string | null;
  decidedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  shiftId: string;
  shiftStartAt: string;
  shiftEndAt: string;
  shiftLocationName?: string | null;
  shiftLocationTimezone?: string | null;
};

export type SwapInbox = {
  outgoing: SwapRequest[];
  incoming: SwapRequest[];
  awaitingApproval: SwapRequest[];
};

export type CreateSwapInput = {
  type: SwapType;
  requestingAssignmentId: string;
  targetStaffId?: string;
  targetAssignmentId?: string;
};
