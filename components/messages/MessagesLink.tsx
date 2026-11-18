"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { unreadCount } from "@/lib/messages/messages";
import { useMyMessages } from "./useMyMessages";

/** "Messages" row on the Friends page, with the number of unread messages. */
export function MessagesLink() {
  const { user } = useCurrentUser();
  const messages = useMyMessages(user?.id);
  if (!user) return null;
  const unread = messages ? unreadCount(messages, user.id) : 0;

  return (
    <Link
      href="/friends/messages"
      className="border-border bg-surface hover:border-brand mb-4 flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition-colors"
    >
      <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-xl">
        <MessageCircle className="size-5" aria-hidden />
      </span>
      <span className="flex-1 font-semibold">Messages</span>
      {unread > 0 && (
        <span className="bg-brand text-brand-foreground min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold">
          {unread}
          <span className="sr-only"> unread</span>
        </span>
      )}
      <ChevronRight className="text-muted size-5" aria-hidden />
    </Link>
  );
}
