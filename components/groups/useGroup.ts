"use client";

import { useCallback, useEffect, useState } from "react";
import { groupService } from "@/lib/services/group.service";
import type { ChatGroup } from "@/types/groups";

/**
 * One group, live. `undefined` while loading, `null` if it doesn't exist or you're not
 * (or no longer) a member.
 */
export function useGroup(groupId: string, userId: string | undefined) {
  const [loaded, setLoaded] = useState<{ key: string; group: ChatGroup | null } | null>(null);
  const key = `${groupId}:${userId}`;

  const reload = useCallback(() => {
    if (!groupId || !userId) return;
    void groupService
      .getGroup(groupId, userId)
      .catch(() => null)
      .then((group) => setLoaded({ key: `${groupId}:${userId}`, group }));
  }, [groupId, userId]);

  useEffect(reload, [reload]);
  useEffect(() => (userId ? groupService.onChange(userId, reload) : undefined), [userId, reload]);

  return { group: loaded?.key === key ? loaded.group : undefined, reload };
}
