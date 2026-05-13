"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";

type ChannelResponse = { channel: "in_app" | "in_app_email" };

export function useNotificationChannel() {
  return useQuery({
    queryKey: [QueryKeys.NotificationChannel],
    queryFn: () => apiClientFetch<ChannelResponse>(APIS.notifications.channel),
  });
}

export function useSetNotificationChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channel: "in_app" | "in_app_email") =>
      apiClientFetch<ChannelResponse>(APIS.notifications.channel, {
        method: "PUT",
        body: JSON.stringify({ channel }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.NotificationChannel],
      });
    },
  });
}
