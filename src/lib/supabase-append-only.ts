/**
 * GOLDEN RULE: Never UPDATE, DELETE, UPSERT, or TRUNCATE Supabase intelligence data.
 * All writes go through insert-only helpers. Readers use fetch/select only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const FORBIDDEN_METHODS = new Set(["PATCH", "PUT", "DELETE"]);

/** Guard REST calls — throws if a destructive HTTP method is used against Supabase. */
export function assertAppendOnlyFetch(input: RequestInfo | URL, init?: RequestInit): void {
  const method = (init?.method ?? "GET").toUpperCase();
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!url.includes("supabase.co/rest/v1/")) return;
  if (FORBIDDEN_METHODS.has(method)) {
    throw new Error(
      `[GOLDEN RULE] Blocked ${method} to Supabase. Append-only: use POST insert for new rows.`,
    );
  }
}

/** Insert a new row — the only permitted write path for intelligence tables. */
export async function appendOnlyInsert<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: string,
  row: T,
) {
  return client.from(table).insert(row);
}