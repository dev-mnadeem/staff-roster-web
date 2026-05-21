"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "@/lib/api/client";
import { QueryKeys } from "@/shared/constants";
import { APIS } from "@/shared/routes";
import type { AuditEntry, ListAuditParams } from "@/types/audit";

export function useAudit(params: ListAuditParams = {}) {
  return useQuery({
    queryKey: [QueryKeys.Audit, params],
    queryFn: () => apiClientFetch<AuditEntry[]>(APIS.audit.list(params)),
  });
}
