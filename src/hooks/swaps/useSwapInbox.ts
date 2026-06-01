"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { SwapInbox } from "@/types/swap";

export function useSwapInbox() {
  return useQuery({
    queryKey: [QueryKeys.Swaps],
    queryFn: () => apiClientFetch<SwapInbox>(APIS.swaps.list),
  });
}
