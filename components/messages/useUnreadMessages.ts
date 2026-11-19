"use client";

import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { unreadCount } from "@/lib/messages/messages";
import { useMyMessages } from "./useMyMessages";

/** Number of unread messages for the signed-in user, live. 0 when signed out or loading. */
export function useUnreadMessages(): number {
  const { user } = useCurrentUser();
  const messages = useMyMessages(user?.id);
  return user && messages ? unreadCount(messages, user.id) : 0;
}
