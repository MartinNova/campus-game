"use client";

import { useCallback, useEffect, useState } from "react";
import { groupService } from "@/lib/services/group.service";
import type { ChatGroup, GroupMessage } from "@/types/groups";

interface MyGroups {
  groups: ChatGroup[];
  messages: GroupMessage[];
}

/** Your groups and their latest messages, kept up to date live. null while loading. */
export function useMyGroups(userId: string | undefined): MyGroups | null {
  const [loaded, setLoaded] = useState<(MyGroups & { userId: string }) | null>(null);

  const reload = useCallback(() => {
    if (!userId) return;
    // A missing table (migration not run yet) just means "no groups".
    void Promise.all([
      groupService.listMyGroups(userId).catch(() => []),
      groupService.listLatestMessages(userId).catch(() => []),
    ]).then(([groups, messages]) => setLoaded({ userId, groups, messages }));
  }, [userId]);

  useEffect(reload, [reload]);
  useEffect(() => (userId ? groupService.onChange(userId, reload) : undefined), [userId, reload]);

  return loaded && loaded.userId === userId ? loaded : null;
}
