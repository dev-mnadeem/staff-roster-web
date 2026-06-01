"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { SetSkillsInput, TeamMember } from "@/types/team";

export function useSetSkills(staffId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetSkillsInput) =>
      apiClientFetch<TeamMember>(APIS.team.setSkills(staffId), {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.TeamMember, staffId],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Team] });
    },
  });
}
