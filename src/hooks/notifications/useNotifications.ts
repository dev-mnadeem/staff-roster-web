"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Notification } from "@/types/notification";

export function useNotifications() {
  return useQuery({
    queryKey: [QueryKeys.Notifications],
    queryFn: () => apiClientFetch<Notification[]>(APIS.notifications.list),
  });
}
