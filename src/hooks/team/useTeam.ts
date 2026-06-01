"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { TeamMember } from "@/types/team";

export function useTeam() {
  return useQuery({
    queryKey: [QueryKeys.Team],
    queryFn: () => apiClientFetch<TeamMember[]>(APIS.team.list),
  });
}
