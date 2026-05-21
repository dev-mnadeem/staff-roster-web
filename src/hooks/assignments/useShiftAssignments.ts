"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { ShiftAssignment } from "@/types/assignment";

export function useShiftAssignments(shiftId: string) {
  return useQuery({
    queryKey: [QueryKeys.Assignments, shiftId],
    queryFn: () =>
      apiClientFetch<ShiftAssignment[]>(APIS.shifts.assignments(shiftId)),
    enabled: Boolean(shiftId),
  });
}
