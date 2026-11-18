"use client";

import { SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { formatMessageTime } from "@/lib/messages/messages";
import { messageService } from "@/lib/services/message.service";
import { MAX_MESSAGE_LENGTH, type Message } from "@/types/messages";

/** One chat with another student (?u=username), live. */
export function ChatView() {
  const username = useSearchParams().get("u") ?? "";
  const { user, users, ready } = useCurrentUser();
  const other = users.find((u) => u.username === username.toLowerCase());
  const userId = user?.id;
  const otherId = other?.id;

  const [thread, setThread] = useState<{ key: string; messages: Message[] } | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const key = `${userId}:${otherId}`;

  const reload = useCallback(() => {
    if (!userId || !otherId) return;
    void messageService
      .listThread(userId, otherId)
      .then((messages) => {
        setThread({ key: `${userId}:${otherId}`, messages });
        // Opening the chat (or a new message arriving while it's open) counts as reading it.
        if (messages.some((m) => m.recipientId === userId && !m.readAt))
          void messageService.markRead(userId, otherId);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load the chat."),
      );
  }, [userId, otherId]);

  useEffect(reload, [reload]);
  useEffect(() => (userId ? messageService.onChange(userId, reload) : undefined), [userId, reload]);

  const messages = thread?.key === key ? thread.messages : null;
  const count = messages?.length ?? 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [count]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!userId || !otherId || sending) return;
    setSending(true);
    setError(null);
    try {
      await messageService.send(userId, otherId, draft);
      setDraft("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;
  if (!user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Sign in to send messages</p>
        <Link href="/login" className="text-brand mt-2 inline-block text-sm underline">
          Sign in or create account
        </Link>
      </Card>
    );
  }
  if (!other) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Student not found</p>
        <p className="text-muted mt-1 text-sm">The account may have been deleted.</p>
      </Card>
    );
  }
  if (other.id === user.id) {
    return (
      <Card className="text-center">
        <p className="font-semibold">That&apos;s you</p>
        <p className="text-muted mt-1 text-sm">Pick someone else to message.</p>
      </Card>
    );
  }

  const name = [other.firstName, other.lastName].filter(Boolean).join(" ") || `@${other.username}`;
  const now = new Date();

  return (
    <div className="grid grid-cols-1 gap-3">
      <Link
        href={`/friends/profile?u=${other.username}`}
        className="border-border bg-surface hover:border-brand flex items-center gap-3 rounded-2xl border p-3 shadow-sm"
      >
        <Avatar
          firstName={other.firstName}
          lastName={other.lastName}
          username={other.username}
          url={other.avatarUrl}
          size={40}
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{name}</span>
          <span className="text-muted block text-sm">View profile</span>
        </span>
      </Link>

      {!messages ? (
        <div className="bg-border h-48 animate-pulse rounded-2xl" aria-busy="true" />
      ) : messages.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">
          Say hi to {other.firstName || name}. Messages are only visible to the two of you.
        </p>
      ) : (
        <ol className="grid gap-1.5 py-2" aria-label={`Chat with ${name}`}>
          {messages.map((m, i) => {
            const mine = m.senderId === user.id;
            const showTime =
              i === 0 ||
              new Date(m.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() >
                15 * 60_000;
            return (
              <li key={m.id} className="grid">
                {showTime && (
                  <span className="text-muted my-2 text-center text-xs">
                    {formatMessageTime(m.createdAt, now)}
                  </span>
                )}
                <span
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] break-words whitespace-pre-line ${
                    mine
                      ? "bg-brand text-brand-foreground justify-self-end rounded-br-md"
                      : "bg-surface border-border justify-self-start rounded-bl-md border"
                  }`}
                >
                  {m.body}
                </span>
              </li>
            );
          })}
          {messages.at(-1)?.senderId === user.id && messages.at(-1)?.readAt && (
            <li className="text-muted justify-self-end text-xs">Seen</li>
          )}
        </ol>
      )}
      <div ref={endRef} />

      <form
        onSubmit={send}
        className="bg-background sticky bottom-24 flex items-end gap-2 pt-2 pb-1"
      >
        <label className="sr-only" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter makes a new line (like WhatsApp Web).
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={`Message ${other.firstName || name}`}
          className="border-border bg-surface focus-visible:outline-brand max-h-32 min-h-11 flex-1 resize-none rounded-2xl border px-4 py-2.5 text-base focus-visible:outline-2"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="bg-brand text-brand-foreground flex size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
        >
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
