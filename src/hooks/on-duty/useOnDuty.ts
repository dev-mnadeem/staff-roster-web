"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { OnDutyLocation } from "@/types/on-duty";

export function useOnDuty() {
  return useQuery({
    queryKey: [QueryKeys.OnDuty],
    queryFn: () => apiClientFetch<OnDutyLocation[]>(APIS.onDuty.list),
    // Live-ish: refetch every 30s and on focus.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
