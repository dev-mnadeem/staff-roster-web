"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CreateSwapInput, SwapRequest } from "@/types/swap";

export function useCreateSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSwapInput) =>
      apiClientFetch<SwapRequest>(APIS.swaps.create, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Swaps] });
    },
  });
}
