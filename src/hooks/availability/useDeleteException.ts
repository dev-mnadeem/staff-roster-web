"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";

export function useDeleteException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClientFetch<void>(APIS.availability.deleteException(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.Availability],
      });
    },
  });
}
