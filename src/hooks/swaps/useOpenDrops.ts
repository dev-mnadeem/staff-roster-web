"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { SwapRequest } from "@/types/swap";

export function useOpenDrops() {
  return useQuery({
    queryKey: [QueryKeys.SwapsOpen],
    queryFn: () => apiClientFetch<SwapRequest[]>(APIS.swaps.open),
  });
}
