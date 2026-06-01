"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { SwapRequest } from "@/types/swap";

type Action = "cancel" | "accept" | "approve" | "reject" | "claim";

const ENDPOINT_FOR: Record<Action, (id: string) => string> = {
  cancel: APIS.swaps.cancel,
  accept: APIS.swaps.accept,
  approve: APIS.swaps.approve,
  reject: APIS.swaps.reject,
  claim: APIS.swaps.claim,
};

export function useSwapAction(action: Action) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClientFetch<SwapRequest>(ENDPOINT_FOR[action](id), {
        method: "POST",
        body: reason ? JSON.stringify({ reason }) : "{}",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Swaps] });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.SwapsOpen] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Assignments],
      });
    },
  });
}
