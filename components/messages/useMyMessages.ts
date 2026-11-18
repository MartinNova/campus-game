"use client";

import { useCallback, useEffect, useState } from "react";
import { messageService } from "@/lib/services/message.service";
import type { Message } from "@/types/messages";

/** Your messages (newest first), kept up to date live. null while loading. */
export function useMyMessages(userId: string | undefined) {
  const [loaded, setLoaded] = useState<{ userId: string; messages: Message[] } | null>(null);

  const reload = useCallback(() => {
    if (!userId) return;
    void messageService
      .listMine(userId)
      .catch(() => [])
      .then((messages) => setLoaded({ userId, messages }));
  }, [userId]);

  useEffect(reload, [reload]);
  useEffect(() => (userId ? messageService.onChange(userId, reload) : undefined), [userId, reload]);

  return loaded && loaded.userId === userId ? loaded.messages : null;
}
