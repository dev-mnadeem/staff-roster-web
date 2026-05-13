"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { SetManagedLocationsInput, TeamMember } from "@/types/team";

export function useSetManagedLocations(managerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetManagedLocationsInput) =>
      apiClientFetch<TeamMember>(APIS.team.setManagedLocations(managerId), {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.TeamMember, managerId],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Team] });
    },
  });
}
