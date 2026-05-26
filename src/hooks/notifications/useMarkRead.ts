"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClientFetch<unknown>(APIS.notifications.markRead(id), {
        method: "POST",
        body: "{}",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Notifications] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.NotificationsUnread],
      });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClientFetch<unknown>(APIS.notifications.markAllRead, {
        method: "POST",
        body: "{}",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Notifications] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.NotificationsUnread],
      });
    },
  });
}
