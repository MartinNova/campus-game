/**
 * Helpers for Nova Microsoft 365 accounts. Pure functions, unit tested.
 */

/** True if the e-mail belongs to one of the allowed domains (case-insensitive). No domains = all allowed. */
export function isAllowedEmail(email: string | null | undefined, domains: string[]): boolean {
  if (domains.length === 0) return !!email;
  const domain = email?.trim().toLowerCase().split("@")[1];
  return !!domain && domains.includes(domain);
}

/** Nova student e-mails start with the student number, e.g. "79109@novasbe.pt" -> "79109". */
export function studentIdFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return /^\d+$/.test(local) ? local : "";
}

/** "Till Fassbender" -> { firstName: "Till", lastName: "Fassbender" }. Everything but the last word is the first name. */
export function splitName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  const lastName = parts.pop()!;
  return { firstName: parts.join(" "), lastName };
}
