import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client: SupabaseClient | null = null;

/**
 * Supabase client for the browser. Only services in lib/services use it,
 * components never talk to Supabase directly (see CONTRIBUTING.md).
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured (see .env.example).");
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

/**
 * A new live-updates channel. Supabase hands back the *same* channel for the same name,
 * and adding listeners to one that is already subscribed throws, which crashes the page.
 * Several components often listen at once (e.g. the tab bar badge and the Messages card),
 * so every subscription gets its own channel.
 */
export function liveChannel(name: string) {
  return getSupabase().channel(`${name}:${crypto.randomUUID()}`);
}
