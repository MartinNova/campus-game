import Link from "next/link";
import { splitMentions } from "@/lib/messages/mentions";

interface MessageTextProps {
  text: string;
  knownUsernames: ReadonlySet<string>;
  /** Your own bubble (white text on navy) or the other person's. */
  mine: boolean;
}

/** Message text where "@username" links to that student's profile. */
export function MessageText({ text, knownUsernames, mine }: MessageTextProps) {
  return splitMentions(text, knownUsernames).map((part, i) =>
    "username" in part ? (
      <Link
        key={i}
        href={`/friends/profile?u=${part.username}`}
        className={`font-semibold underline-offset-2 hover:underline ${
          mine ? "underline" : "text-brand"
        }`}
      >
        {part.text}
      </Link>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}
