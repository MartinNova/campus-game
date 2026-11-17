/**
 * Supabase settings from .env.local (see .env.example and docs/microsoft-login.md).
 *
 * Without these values the app keeps using the demo login, so nobody in the
 * team needs a Supabase account to work on their module.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

/** "microsoft" = real sign-in with the Nova account, "demo" = account switcher with mock users. */
export const AUTH_MODE: "microsoft" | "demo" = isSupabaseConfigured ? "microsoft" : "demo";

/** Only these e-mail domains may sign in, e.g. "novasbe.pt". */
export const ALLOWED_EMAIL_DOMAINS = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "novasbe.pt")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
