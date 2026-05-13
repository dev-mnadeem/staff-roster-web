"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { UnreadCount } from "@/types/notification";

export function useUnreadCount() {
  return useQuery({
    queryKey: [QueryKeys.NotificationsUnread],
    queryFn: () => apiClientFetch<UnreadCount>(APIS.notifications.unreadCount),
  });
}
