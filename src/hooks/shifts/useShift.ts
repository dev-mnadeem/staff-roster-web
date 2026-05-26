"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Shift } from "@/types/shift";

export function useShift(id: string) {
  return useQuery({
    queryKey: [QueryKeys.Shift, id],
    queryFn: () => apiClientFetch<Shift>(APIS.shifts.detail(id)),
    enabled: Boolean(id),
  });
}
