"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { ListShiftsParams, Shift } from "@/types/shift";

export function useShifts(params: ListShiftsParams = {}) {
  return useQuery({
    queryKey: [QueryKeys.Shifts, params],
    queryFn: () => apiClientFetch<Shift[]>(APIS.shifts.list(params)),
  });
}
