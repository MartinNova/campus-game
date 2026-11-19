"use client";

import { MessageCircle } from "lucide-react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { LinkCard } from "@/components/ui/Card";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { useUnreadMessages } from "./useUnreadMessages";

/** "Messages" card on the Friends page, with a red badge for unread messages. */
export function MessagesLink() {
  const { user } = useCurrentUser();
  const unread = useUnreadMessages();
  if (!user) return null;

  return (
    <div className="mb-4">
      <LinkCard
        href="/friends/messages"
        title="Messages"
        description={
          unread > 0
            ? `${unread} new message${unread === 1 ? "" : "s"}`
            : "Your chats with students"
        }
        icon={
          <span className="relative flex">
            <MessageCircle className="size-5" aria-hidden />
            <UnreadBadge count={unread} className="-top-4 -right-4" />
          </span>
        }
      />
    </div>
  );
}
