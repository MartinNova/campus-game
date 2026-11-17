/**
 * Accepts what people paste ("moodle.novasbe.pt/course/view.php?id=1") and returns a safe
 * https/http URL, or null if it isn't a usable web link (blocks e.g. "javascript:" links).
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
