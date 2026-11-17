/**
 * Supabase settings from .env.local (see .env.example and docs/accounts.md).
 *
 * Without these values the app keeps using the demo login, so nobody in the
 * team needs a Supabase account to work on their module.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

/** "accounts" = real accounts (e-mail + password), "demo" = account switcher with mock users. */
export const AUTH_MODE: "accounts" | "demo" = isSupabaseConfigured ? "accounts" : "demo";

/**
 * Extra "Sign in with Microsoft" button. Off until the Azure app registration
 * exists (needs Nova IT, see docs/microsoft-login.md).
 */
export const MICROSOFT_LOGIN_ENABLED = process.env.NEXT_PUBLIC_MICROSOFT_LOGIN === "true";

/** Optional: only these e-mail domains may sign in, e.g. "novasbe.pt". Empty = everyone. */
export const ALLOWED_EMAIL_DOMAINS = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
