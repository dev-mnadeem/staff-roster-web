"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CreateLocationInput, Location } from "@/types/location";

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLocationInput) =>
      apiClientFetch<Location>(APIS.locations.create, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Locations] });
    },
  });
}
