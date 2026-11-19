"use client";

import { useMyGroups } from "@/components/groups/useMyGroups";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { groupConversations } from "@/lib/groups/groups";
import { unreadCount } from "@/lib/messages/messages";
import { useMyMessages } from "./useMyMessages";

/** Unread messages for the signed-in user (direct and groups), live. 0 when signed out or loading. */
export function useUnreadMessages(): number {
  const { user } = useCurrentUser();
  const messages = useMyMessages(user?.id);
  const groups = useMyGroups(user?.id);
  if (!user) return 0;
  const direct = messages ? unreadCount(messages, user.id) : 0;
  const inGroups = groups
    ? groupConversations(groups.groups, groups.messages, user.id).reduce((n, c) => n + c.unread, 0)
    : 0;
  return direct + inGroups;
}
