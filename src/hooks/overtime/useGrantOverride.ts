"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CreateOverrideInput, OvertimeOverride } from "@/types/overtime";

export function useGrantOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOverrideInput) =>
      apiClientFetch<OvertimeOverride>(APIS.overtime.createOverride, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.OvertimeOverrides, variables.staffId],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.DryRun] });
    },
  });
}
