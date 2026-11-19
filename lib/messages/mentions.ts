/** "@username" in a message becomes a link to that student's profile. */

export type MessagePart = { text: string } | { text: string; username: string };

// "@" at the start or after a space/bracket, so e-mail addresses (max@novasbe.pt) stay text.
const MENTION = /(^|[\s([{"'])@([a-z0-9_.]{3,20})/gi;

/**
 * Splits a message into plain text and mentions. Only usernames that exist become mentions,
 * and a full stop right after a name ("see you @lukas.weber.") isn't part of it.
 */
export function splitMentions(text: string, knownUsernames: ReadonlySet<string>): MessagePart[] {
  const parts: MessagePart[] = [];
  let last = 0;
  for (const match of text.matchAll(MENTION)) {
    const [, before, raw] = match;
    let username = raw.toLowerCase();
    while (username.endsWith(".") && !knownUsernames.has(username))
      username = username.slice(0, -1);
    if (!knownUsernames.has(username)) continue;

    const start = match.index + before.length;
    const end = start + 1 + username.length;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ text: text.slice(start, end), username });
    last = end;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
