"use client";

import { useEffect, useRef } from "react";
import type {
  RealtimePostgresChangesPayload,
  RealtimePostgresChangesFilter,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth/mode";

/**
 * How often to re-check for changes when live subscriptions are unavailable.
 * Long enough not to hammer the API, short enough that a notification does not
 * feel lost.
 */
const POLL_INTERVAL_MS = 15_000;

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
  // Hold the latest callback in a ref so the subscription is created once and
  // not torn down on every render. Assigned in an effect rather than during
  // render, which React forbids: a render may be discarded, and mutating a ref
  // on the way through would leave the ref reflecting work that never
  // committed.
  const callbackRef = useRef(onChange);
  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  const { table, filter, event = "*", channelKey } = options;

  useEffect(() => {
    // Postgres Changes is a Supabase feature. Self-hosted, there is nothing to
    // subscribe to, so the same callback is driven on an interval instead:
    // consumers refetch either way, so they need no knowledge of which is
    // running. Polling is a downgrade in latency, not in correctness.
    if (!isSupabaseConfigured()) {
      const id = setInterval(() => {
        callbackRef.current({
          eventType: "UPDATE",
          new: {} as T,
          old: {} as T,
          schema: "public",
          table,
          commit_timestamp: new Date().toISOString(),
          errors: null,
        } as unknown as RealtimePostgresChangesPayload<T>);
      }, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }

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
