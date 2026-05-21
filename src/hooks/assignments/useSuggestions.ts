"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Suggestion } from "@/types/audit";

export function useSuggestions(shiftId: string, enabled: boolean) {
  return useQuery({
    queryKey: [QueryKeys.Suggestions, shiftId],
    queryFn: () =>
      apiClientFetch<Suggestion[]>(APIS.shifts.suggestions(shiftId, 3)),
    enabled: Boolean(shiftId) && enabled,
    staleTime: 0,
  });
}
