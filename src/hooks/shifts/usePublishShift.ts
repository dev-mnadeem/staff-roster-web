"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Shift } from "@/types/shift";

export function usePublishShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      apiClientFetch<Shift>(APIS.shifts.publish(id), {
        method: "POST",
        body: JSON.stringify({ version }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Shifts] });
    },
  });
}
