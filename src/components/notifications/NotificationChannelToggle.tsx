"use client";

import { type FunctionComponent } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  useNotificationChannel,
  useSetNotificationChannel,
} from "@/hooks/notifications";

export const NotificationChannelToggle: FunctionComponent = () => {
  const { data, isLoading } = useNotificationChannel();
  const setChannel = useSetNotificationChannel();

  if (isLoading || !data) return null;

  const wantsEmail = data.channel === "in_app_email";

  return (
    <div className="flex items-center gap-2 text-sm">
      <Label
        htmlFor="email-toggle"
        className="flex items-center gap-2 font-normal"
      >
        <input
          id="email-toggle"
          type="checkbox"
          checked={wantsEmail}
          onChange={(event) => {
            const next = event.target.checked ? "in_app_email" : "in_app";
            setChannel.mutate(next, {
              onSuccess: () => toast.success("Notification preference saved"),
              onError: (e) => toast.error(e.message),
            });
          }}
        />
        <span>Also send simulated email notifications</span>
      </Label>
    </div>
  );
};
