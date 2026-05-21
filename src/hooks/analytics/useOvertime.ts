"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { OvertimeProjection } from "@/types/analytics";

export function useOvertime(params: { weekStart?: string } = {}) {
  return useQuery({
    queryKey: [QueryKeys.AnalyticsOvertime, params],
    queryFn: () =>
      apiClientFetch<OvertimeProjection>(APIS.analytics.overtime(params)),
  });
}
