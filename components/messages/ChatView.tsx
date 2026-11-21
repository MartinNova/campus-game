"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { OnlineDot } from "@/components/presence/OnlineDot";
import { useIsOnline } from "@/components/presence/PresenceProvider";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { messageService } from "@/lib/services/message.service";
import { directChatKey, presenceService } from "@/lib/services/presence.service";
import type { Attachment, Message } from "@/types/messages";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { TypingBubble } from "./TypingBubble";

/** One chat with another student (?u=username), live. */
export function ChatView() {
  const username = useSearchParams().get("u") ?? "";
  const { user, users, ready } = useCurrentUser();
  const other = users.find((u) => u.username === username.toLowerCase());
  const userId = user?.id;
  const otherId = other?.id;

  const [thread, setThread] = useState<{ key: string; messages: Message[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const knownUsernames = new Set(users.map((u) => u.username).filter((u): u is string => !!u));
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

  // "is typing…": shown until 3 s after the other person's last keystroke.
  const otherOnline = useIsOnline(otherId);
  const [typingAt, setTypingAt] = useState(0);
  const [now, setNow] = useState(0);
  const chat = useRef<{ typing: () => void } | null>(null);
  const lastSent = useRef(0);
  useEffect(() => {
    if (!userId || !otherId) return;
    const joined = presenceService.joinChat(directChatKey(userId, otherId), userId, () => {
      const t = Date.now();
      setTypingAt(t);
      setNow(t);
    });
    chat.current = joined;
    return () => {
      chat.current = null;
      joined.leave();
    };
  }, [userId, otherId]);
  useEffect(() => {
    if (!typingAt) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [typingAt]);
  // A message from them after they started typing ends "typing…" right away.
  const lastFromOther = messages?.filter((m) => m.senderId === otherId).at(-1)?.createdAt;
  const otherTyping =
    typingAt > 0 &&
    now - typingAt < 3000 &&
    !(lastFromOther && new Date(lastFromOther).getTime() > typingAt);

  function handleTyping() {
    // At most one signal every 2 seconds.
    if (Date.now() - lastSent.current < 2000) return;
    lastSent.current = Date.now();
    chat.current?.typing();
  }

  async function send(body: string, attachment?: Attachment) {
    if (!userId || !otherId) return;
    await messageService.send(userId, otherId, body, attachment);
    reload();
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

  return (
    <div className="grid grid-cols-1 gap-3">
      <Link
        href={`/friends/profile?u=${other.username}`}
        className="bg-surface focus-visible:outline-brand active:bg-brand/5 flex items-center gap-3 rounded-3xl p-3 transition focus-visible:outline-2 active:scale-[0.98]"
      >
        <OnlineDot userId={other.id}>
          <Avatar
            firstName={other.firstName}
            lastName={other.lastName}
            username={other.username}
            url={other.avatarUrl}
            size={40}
          />
        </OnlineDot>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{name}</span>
          <span
            className={`block text-sm ${otherTyping || otherOnline ? "text-green-600 dark:text-green-400" : "text-muted"}`}
            aria-live="polite"
          >
            {otherTyping ? "typing…" : otherOnline ? "online" : "View profile"}
          </span>
        </span>
      </Link>

      {!messages ? (
        <div className="bg-border h-48 animate-pulse rounded-2xl" aria-busy="true" />
      ) : messages.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">
          Say hi to {other.firstName || name}. Messages are only visible to the two of you.
        </p>
      ) : (
        <MessageList
          items={messages}
          userId={user.id}
          knownUsernames={knownUsernames}
          label={`Chat with ${name}`}
          footer={
            messages.at(-1)?.senderId === user.id &&
            messages.at(-1)?.readAt && <li className="text-muted justify-self-end text-xs">Seen</li>
          }
        />
      )}

      {otherTyping && <TypingBubble name={other.firstName || name} />}

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <Composer
        placeholder={`Message ${other.firstName || name}`}
        onSend={send}
        onTyping={handleTyping}
      />
    </div>
  );
}
