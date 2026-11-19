"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import {
  badgeLabel,
  formatMessageTime,
  groupConversations,
  messagePreview,
} from "@/lib/messages/messages";
import { useMyMessages } from "./useMyMessages";

/** All your chats, most recent first. */
export function InboxView() {
  const { user, users, ready } = useCurrentUser();
  const messages = useMyMessages(user?.id);

  if (ready && !user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Sign in to see your messages</p>
        <Link href="/login" className="text-brand mt-2 inline-block text-sm underline">
          Sign in or create account
        </Link>
      </Card>
    );
  }
  if (!user || !messages) {
    return <div className="bg-border h-48 animate-pulse rounded-2xl" aria-busy="true" />;
  }

  const chats = groupConversations(messages, user.id);
  if (chats.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="bg-brand text-brand-foreground flex size-14 items-center justify-center rounded-2xl">
          <MessageCircle className="size-7" aria-hidden />
        </span>
        <p className="font-semibold">No messages yet</p>
        <p className="text-muted max-w-xs text-sm">
          Find someone in Friends and say hi, or message the person behind a room or padel match.
        </p>
        <Link
          href="/friends"
          className="bg-brand text-brand-foreground inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium hover:opacity-90"
        >
          Find students
        </Link>
      </Card>
    );
  }

  const now = new Date();
  return (
    <ul className="grid gap-2">
      {chats.map(({ otherUserId, last, unread }) => {
        const other = users.find((u) => u.id === otherUserId);
        const name = other
          ? [other.firstName, other.lastName].filter(Boolean).join(" ") || `@${other.username}`
          : "Student";
        const href = other?.username ? `/friends/chat?u=${other.username}` : "/friends/messages";
        return (
          <li key={otherUserId}>
            <Link
              href={href}
              className="border-border bg-surface hover:border-brand flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition-colors"
            >
              <Avatar
                firstName={other?.firstName ?? "?"}
                lastName={other?.lastName ?? ""}
                username={other?.username}
                url={other?.avatarUrl}
                size={48}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate ${unread ? "font-bold" : "font-semibold"}`}>
                    {name}
                  </span>
                  <span className="text-muted shrink-0 text-xs">
                    {formatMessageTime(last.createdAt, now)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${unread ? "text-foreground font-medium" : "text-muted"}`}
                  >
                    {last.senderId === user.id ? "You: " : ""}
                    {messagePreview(last)}
                  </span>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#d70015] px-1.5 text-[12px] font-semibold text-white tabular-nums">
                      {badgeLabel(unread)}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
