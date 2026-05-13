"use client";

import Link from "next/link";
import { type FunctionComponent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSwapAction, useSwapInbox } from "@/hooks/swaps";
import { formatInLocationTz } from "@/lib/time/format";
import { ROUTES } from "@/shared/routes";
import { SwapStatus, SwapType, type SwapRequest } from "@/types/swap";

export type SwapsInboxProps = {
  canApprove: boolean;
};

export const SwapsInbox: FunctionComponent<SwapsInboxProps> = ({
  canApprove,
}) => {
  const { data, isLoading, error } = useSwapInbox();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading swap inbox…</p>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <Section title="Incoming" subtitle="Swaps waiting on you to accept">
        {data.incoming.length === 0 ? (
          <Empty text="Nothing waiting on you." />
        ) : (
          <div className="grid gap-3">
            {data.incoming.map((s) => (
              <SwapCard key={s.id} swap={s} role="incoming" />
            ))}
          </div>
        )}
      </Section>

      <Section title="Outgoing" subtitle="Requests you've made">
        {data.outgoing.length === 0 ? (
          <Empty text="No outgoing requests." />
        ) : (
          <div className="grid gap-3">
            {data.outgoing.map((s) => (
              <SwapCard key={s.id} swap={s} role="outgoing" />
            ))}
          </div>
        )}
      </Section>

      {canApprove ? (
        <Section
          title="Awaiting approval"
          subtitle="Manager queue: pending and peer-accepted requests"
        >
          {data.awaitingApproval.length === 0 ? (
            <Empty text="Approval queue is clear." />
          ) : (
            <div className="grid gap-3">
              {data.awaitingApproval.map((s) => (
                <SwapCard key={s.id} swap={s} role="manager" />
              ))}
            </div>
          )}
        </Section>
      ) : null}
    </div>
  );
};

const Section: FunctionComponent<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="flex flex-col gap-2">
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
    {children}
  </div>
);

const Empty: FunctionComponent<{ text: string }> = ({ text }) => (
  <Card>
    <CardHeader>
      <CardDescription>{text}</CardDescription>
    </CardHeader>
  </Card>
);

const STATUS_VARIANT: Record<
  SwapStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [SwapStatus.Pending]: "outline",
  [SwapStatus.AcceptedByPeer]: "secondary",
  [SwapStatus.Approved]: "default",
  [SwapStatus.Rejected]: "destructive",
  [SwapStatus.Cancelled]: "outline",
  [SwapStatus.Expired]: "outline",
};

type SwapCardProps = {
  swap: SwapRequest;
  role: "incoming" | "outgoing" | "manager";
};

const SwapCard: FunctionComponent<SwapCardProps> = ({ swap, role }) => {
  const cancel = useSwapAction("cancel");
  const accept = useSwapAction("accept");
  const approve = useSwapAction("approve");
  const reject = useSwapAction("reject");

  const tz = swap.shiftLocationTimezone ?? "UTC";
  const start = formatInLocationTz(swap.shiftStartAt, tz);
  const end = formatInLocationTz(swap.shiftEndAt, tz, "h:mm a zzz");

  const isFinal = [
    SwapStatus.Approved,
    SwapStatus.Rejected,
    SwapStatus.Cancelled,
    SwapStatus.Expired,
  ].includes(swap.status);

  const handleAction = (
    actionName: string,
    mutation: ReturnType<typeof useSwapAction>,
    payload: { id: string; reason?: string },
  ) => {
    mutation.mutate(payload, {
      onSuccess: () => toast.success(`Request ${actionName}`),
      onError: (e) => toast.error(e.message),
    });
  };

  const onReject = () => {
    const reason = window.prompt("Optional reason:") ?? undefined;
    handleAction("rejected", reject, { id: swap.id, reason });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {swap.type === SwapType.Drop ? "Drop" : "Swap"} ·{" "}
              {swap.shiftLocationName ?? "Shift"}
            </CardTitle>
            <CardDescription>
              {start} → {end}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[swap.status]}>{swap.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="text-muted-foreground">
          Requester:{" "}
          {swap.requesterDisplayName ?? swap.requesterId.slice(0, 8)}
          {swap.targetStaffId ? (
            <>
              {" "}· Peer:{" "}
              {swap.targetStaffDisplayName ?? swap.targetStaffId.slice(0, 8)}
            </>
          ) : null}
          {swap.expiresAt ? (
            <>
              {" "}· Expires {formatInLocationTz(swap.expiresAt, tz)}
            </>
          ) : null}
        </div>
        {swap.rejectionReason ? (
          <div className="text-destructive text-xs">
            Rejection reason: {swap.rejectionReason}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link
            href={ROUTES.shiftDetail(swap.shiftId)}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Open shift
          </Link>
          {role === "outgoing" && !isFinal ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleAction("cancelled", cancel, { id: swap.id })
              }
              disabled={cancel.isPending}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel"}
            </Button>
          ) : null}
          {role === "incoming" &&
          swap.type === SwapType.Swap &&
          swap.status === SwapStatus.Pending ? (
            <Button
              size="sm"
              onClick={() =>
                handleAction("accepted", accept, { id: swap.id })
              }
              disabled={accept.isPending}
            >
              {accept.isPending ? "Accepting…" : "Accept"}
            </Button>
          ) : null}
          {role === "manager" && !isFinal ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  handleAction("approved", approve, { id: swap.id })
                }
                disabled={approve.isPending}
              >
                {approve.isPending ? "Approving…" : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                disabled={reject.isPending}
              >
                {reject.isPending ? "Rejecting…" : "Reject"}
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
