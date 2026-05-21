"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type {
  AvailabilityException,
  CreateExceptionInput,
} from "@/types/availability";

export function useCreateException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExceptionInput) =>
      apiClientFetch<AvailabilityException>(
        APIS.availability.createException,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Availability],
      });
    },
  });
}
