"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";

export function useUnassignStaff(shiftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) =>
      apiClientFetch<void>(APIS.shifts.unassign(shiftId, staffId), {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Assignments, shiftId],
      });
    },
  });
}
