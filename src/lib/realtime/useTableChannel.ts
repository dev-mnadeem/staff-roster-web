"use client";

import { useEffect, useRef } from "react";
import type {
  RealtimePostgresChangesPayload,
  RealtimePostgresChangesFilter,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Event = "INSERT" | "UPDATE" | "DELETE" | "*";

type Options = {
  /** Public schema table name. */
  table: string;
  /** Optional `column=value` filter, e.g. "user_id=eq.<uuid>". */
  filter?: string;
  /** Default '*' (all change types). */
  event?: Event;
  /** Channel name suffix; rotates the subscription when it changes. */
  channelKey?: string;
};

/**
 * Subscribes to Supabase Postgres Changes for a single table. The callback
 * receives the raw `payload` Supabase emits — { eventType, new, old, ... }.
 * The subscription tears down on unmount or when any option changes.
 *
 * RLS on the target table determines which rows are delivered; the BE inserts
 * with the service-role key, but the FE only sees rows it's authorised to see.
 */
export function useTableChannel<T extends Record<string, unknown>>(
  options: Options,
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void,
): void {
  // Hold the latest callback in a ref so we can subscribe once and not retear
  // on every render.
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  const { table, filter, event = "*", channelKey } = options;

  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime:${table}:${channelKey ?? filter ?? "all"}`;
    const config: RealtimePostgresChangesFilter<typeof event> = {
      event,
      schema: "public",
      table,
      ...(filter ? { filter } : {}),
    };
    const channel = supabase
      .channel(channelName)
      // The supabase-js types for postgres_changes are notoriously loose; cast
      // through unknown to keep our typed callback shape.
      .on(
        "postgres_changes" as never,
        config as never,
        ((payload: RealtimePostgresChangesPayload<T>) => {
          callbackRef.current(payload);
        }) as never,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter, event, channelKey]);
}
