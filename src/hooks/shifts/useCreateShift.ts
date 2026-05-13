"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CreateShiftInput, Shift } from "@/types/shift";

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShiftInput) =>
      apiClientFetch<Shift>(APIS.shifts.create, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Shifts] });
    },
  });
}
