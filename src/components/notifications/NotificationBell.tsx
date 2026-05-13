"use client";

import { useState, type FunctionComponent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/notifications";
import { useTableChannel } from "@/lib/realtime/useTableChannel";
import { QueryKeys } from "@/shared/constants";
import { NotificationType, type Notification } from "@/types/notification";

export type NotificationBellProps = {
  userId: string;
};

export const NotificationBell: FunctionComponent<NotificationBellProps> = ({
  userId,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  // Subscribe to live notifications for this user. RLS on the table ensures
  // we only ever receive rows where user_id matches; we still pass an explicit
  // filter so the channel doesn't have to deliver-then-drop.
  useTableChannel<Notification>(
    {
      table: "notifications",
      filter: `user_id=eq.${userId}`,
      channelKey: userId,
    },
    (payload) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Notifications],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.NotificationsUnread],
      });
      if (payload.eventType === "INSERT") {
        const row = payload.new as Notification;
        toast.message(row.title, {
          description: row.body ?? undefined,
        });
        // Route invalidations off the notification type so other open pages
        // (swaps inbox, shift detail, etc.) refetch live without each needing
        // their own Realtime subscription.
        const t = row.type;
        if (
          t === NotificationType.SwapRequested ||
          t === NotificationType.SwapAccepted ||
          t === NotificationType.SwapApproved ||
          t === NotificationType.SwapRejected ||
          t === NotificationType.SwapCancelled ||
          t === NotificationType.SwapExpired
        ) {
          void queryClient.invalidateQueries({ queryKey: [QueryKeys.Swaps] });
        }
        if (
          t === NotificationType.ShiftAssigned ||
          t === NotificationType.ShiftUnassigned ||
          t === NotificationType.ShiftEdited ||
          t === NotificationType.ShiftPublished
        ) {
          void queryClient.invalidateQueries({ queryKey: [QueryKeys.Shifts] });
          void queryClient.invalidateQueries({
            queryKey: [QueryKeys.Assignments],
          });
        }
      }
    },
  );

  const unreadCount = unread?.count ?? 0;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Notifications
        {unreadCount > 0 ? (
          <Badge variant="default" className="ml-2">
            {unreadCount}
          </Badge>
        ) : null}
      </Button>
      {open ? (
        <Card className="absolute right-0 z-20 mt-2 w-80 max-h-[28rem] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Notifications</CardTitle>
            {unreadCount > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  markAllRead.mutate(undefined, {
                    onError: (e) => toast.error(e.message),
                  })
                }
                disabled={markAllRead.isPending}
              >
                Mark all read
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {!notifications || notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={() =>
                    markRead.mutate(n.id, {
                      onError: (e) => toast.error(e.message),
                    })
                  }
                />
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

const NotificationRow: FunctionComponent<{
  notification: Notification;
  onMarkRead: () => void;
}> = ({ notification, onMarkRead }) => {
  const isUnread = !notification.readAt;
  return (
    <div
      className={
        "rounded-md border p-2 text-sm " +
        (isUnread ? "border-primary/40 bg-primary/5" : "border-border")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{notification.title}</div>
        {isUnread ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkRead}
          >
            Read
          </Button>
        ) : null}
      </div>
      {notification.body ? (
        <div className="text-muted-foreground text-xs">
          {notification.body}
        </div>
      ) : null}
      <div className="text-muted-foreground mt-1 text-xs">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  );
};
