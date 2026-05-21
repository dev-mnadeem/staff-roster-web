"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { DryRunResult } from "@/types/overtime";

export function useAssignmentDryRun(shiftId: string, staffId: string) {
  return useQuery({
    queryKey: [QueryKeys.DryRun, shiftId, staffId],
    queryFn: () =>
      apiClientFetch<DryRunResult>(APIS.shifts.dryRun(shiftId, staffId)),
    enabled: Boolean(shiftId && staffId),
    // Re-evaluate on every selection — overrides may have just been granted.
    staleTime: 0,
  });
}
