"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type {
  CreateAssignmentInput,
  ShiftAssignment,
} from "@/types/assignment";

export function useAssignStaff(shiftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAssignmentInput) =>
      apiClientFetch<ShiftAssignment>(APIS.shifts.assignments(shiftId), {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Assignments, shiftId],
      });
    },
  });
}
