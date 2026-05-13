"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { FairnessReport } from "@/types/analytics";

export function useFairness(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: [QueryKeys.AnalyticsFairness, params],
    queryFn: () =>
      apiClientFetch<FairnessReport>(APIS.analytics.fairness(params)),
  });
}
