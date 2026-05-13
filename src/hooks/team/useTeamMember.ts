"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { TeamMember } from "@/types/team";

export function useTeamMember(id: string) {
  return useQuery({
    queryKey: [QueryKeys.TeamMember, id],
    queryFn: () => apiClientFetch<TeamMember>(APIS.team.detail(id)),
    enabled: Boolean(id),
  });
}
