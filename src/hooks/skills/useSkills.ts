"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Skill } from "@/types/skill";

export function useSkills() {
  return useQuery({
    queryKey: [QueryKeys.Skills],
    queryFn: () => apiClientFetch<Skill[]>(APIS.skills.list),
  });
}
