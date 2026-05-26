"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { Location } from "@/types/location";

export function useLocations() {
  return useQuery({
    queryKey: [QueryKeys.Locations],
    queryFn: () => apiClientFetch<Location[]>(APIS.locations.list),
  });
}
