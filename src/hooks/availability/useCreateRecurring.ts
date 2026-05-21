"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type {
  CreateRecurringInput,
  RecurringAvailability,
} from "@/types/availability";

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecurringInput) =>
      apiClientFetch<RecurringAvailability>(APIS.availability.createRecurring, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Availability],
      });
    },
  });
}
