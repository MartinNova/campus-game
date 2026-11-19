"use client";

import { MessageCircle, Users } from "lucide-react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { LinkCard } from "@/components/ui/Card";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { useUnreadMessages } from "./useUnreadMessages";

/** "Messages" (with a red badge for unread messages) and "New group" cards on the Friends page. */
export function MessagesLink() {
  const { user } = useCurrentUser();
  const unread = useUnreadMessages();
  if (!user) return null;

  return (
    <div className="mb-4 flex flex-col gap-3">
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
      <LinkCard
        href="/friends/groups/new"
        title="New group"
        description="Chat with several students at once"
        icon={<Users className="size-5" aria-hidden />}
      />
    </div>
  );
}
