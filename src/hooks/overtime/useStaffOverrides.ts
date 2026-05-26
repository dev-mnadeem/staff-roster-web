"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { OvertimeOverride } from "@/types/overtime";

export function useStaffOverrides(staffId: string) {
  return useQuery({
    queryKey: [QueryKeys.OvertimeOverrides, staffId],
    queryFn: () =>
      apiClientFetch<OvertimeOverride[]>(APIS.overtime.listOverrides(staffId)),
    enabled: Boolean(staffId),
  });
}
