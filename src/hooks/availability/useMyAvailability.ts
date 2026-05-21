"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Availability } from "@/types/availability";

export function useMyAvailability() {
  return useQuery({
    queryKey: [QueryKeys.Availability, "me"],
    queryFn: () => apiClientFetch<Availability>(APIS.availability.me),
  });
}
