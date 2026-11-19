import { validatePassword } from "@/lib/profile/profile-rules";

/** Where the reset e-mail sends you after the link was checked. */
export const RESET_PASSWORD_PATH = "/reset-password";

/**
 * Only paths inside this app are allowed after a login link, e.g. "/reset-password".
 * Anything else ("https://evil.com", "//evil.com") falls back, so links can't redirect elsewhere.
 */
export function safeNextPath(next: string | null, fallback = "/profile"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\"))
    return fallback;
  return next;
}

/** Returns an error message, or null if the new password can be saved. */
export function checkNewPassword(password: string, repeated: string): string | null {
  return (
    validatePassword(password) ?? (password !== repeated ? "The passwords don't match." : null)
  );
}
