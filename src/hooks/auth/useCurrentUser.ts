"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { APIS } from "@/shared/routes";
import { QueryKeys } from "@/shared/constants";
import type { CurrentUser } from "@/types/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: [QueryKeys.CurrentUser],
    queryFn: () => apiClientFetch<CurrentUser>(APIS.auth.me),
  });
}
