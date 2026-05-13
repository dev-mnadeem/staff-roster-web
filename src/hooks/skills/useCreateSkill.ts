"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { CreateSkillInput, Skill } from "@/types/skill";

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSkillInput) =>
      apiClientFetch<Skill>(APIS.skills.create, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.Skills] });
    },
  });
}
