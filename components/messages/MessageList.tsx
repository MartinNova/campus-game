"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMessageTime } from "@/lib/messages/messages";
import type { MessageFile } from "@/types/messages";
import { FileCard } from "./FileCard";
import { MessageText } from "./MessageText";

/** What a bubble needs; direct and group messages both fit. */
export interface ChatItem {
  id: string;
  senderId: string;
  body: string;
  imageUrl: string | null;
  file: MessageFile | null;
  createdAt: string;
}

/** Colours for sender names in groups (like WhatsApp), all ≥ 4.5:1 on white and dark. */
const SENDER_COLORS = [
  "text-[#0b6e78] dark:text-[#5cc8d2]",
  "text-[#b5651d] dark:text-[#f0a868]",
  "text-[#2e7d32] dark:text-[#7cc47f]",
  "text-[#7b3fa0] dark:text-[#c79be0]",
  "text-[#a8325e] dark:text-[#f08cb3]",
  "text-[#0b2a4a] dark:text-[#7fb2e5]",
];

function colorFor(userId: string) {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SENDER_COLORS[hash % SENDER_COLORS.length];
}

interface MessageListProps {
  items: ChatItem[];
  userId: string;
  knownUsernames: ReadonlySet<string>;
  label: string;
  /** Groups: show the sender's name above their messages. */
  nameOf?: (userId: string) => string;
  /** Shown after the last message, e.g. "Seen". */
  footer?: React.ReactNode;
}

/** Chat bubbles with times, pictures (tap for full screen), files and @mentions. */
export function MessageList({
  items,
  userId,
  knownUsernames,
  label,
  nameOf,
  footer,
}: MessageListProps) {
  const [viewing, setViewing] = useState<string | null>(null);
  const now = new Date();

  // Newest message at the bottom, just above the message field (like any messenger).
  const count = items.length;
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [count]);

  // Escape closes the full-screen picture.
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  return (
    <>
      <ol className="grid gap-1.5 py-2" aria-label={label}>
        {items.map((m, i) => {
          const mine = m.senderId === userId;
          const prev = items[i - 1];
          const showTime =
            !prev ||
            new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > 15 * 60_000;
          const showSender =
            Boolean(nameOf) && !mine && (showTime || prev?.senderId !== m.senderId);
          const attachment = Boolean(m.imageUrl || m.file);
          return (
            <li key={m.id} className="grid">
              {showTime && (
                <span className="text-muted my-2 text-center text-xs">
                  {formatMessageTime(m.createdAt, now)}
                </span>
              )}
              {showSender && nameOf && (
                <span
                  className={`mt-1 mb-0.5 ml-3 text-[13px] font-semibold ${colorFor(m.senderId)}`}
                >
                  {nameOf(m.senderId)}
                </span>
              )}
              <span
                className={`flex max-w-[80%] flex-col overflow-hidden rounded-2xl text-[15px] break-words whitespace-pre-line ${
                  mine
                    ? "bg-brand text-brand-foreground justify-self-end rounded-br-md"
                    : "bg-surface justify-self-start rounded-bl-md"
                } ${attachment ? "p-1" : "px-3.5 py-2"}`}
              >
                {m.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setViewing(m.imageUrl)}
                    className="focus-visible:outline-brand block rounded-[14px] focus-visible:outline-2"
                    aria-label="Open picture"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed or data URL, already resized */}
                    <img
                      src={m.imageUrl}
                      alt=""
                      loading="lazy"
                      className="max-h-80 w-full min-w-40 rounded-[14px] object-cover"
                    />
                  </button>
                )}
                {m.file && <FileCard file={m.file} mine={mine} />}
                {m.body && (
                  <span className={attachment ? "px-2.5 pt-1.5 pb-1" : ""}>
                    <MessageText text={m.body} knownUsernames={knownUsernames} mine={mine} />
                  </span>
                )}
              </span>
            </li>
          );
        })}
        {footer}
      </ol>

      {viewing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Picture"
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewing(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed or data URL, already resized */}
          <img src={viewing} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            type="button"
            onClick={() => setViewing(null)}
            aria-label="Close picture"
            autoFocus
            className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
