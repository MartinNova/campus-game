"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { EMPTY_PRESENCE } from "@/lib/presence/presence";
import { presenceService } from "@/lib/services/presence.service";
import type { PresenceSnapshot } from "@/types/presence";
import { useCurrentUser } from "./CurrentUserProvider";

interface PresenceContextValue {
  presence: PresenceSnapshot;
  /** The chat you're typing in right now; null = not typing. */
  setTyping: (chat: string | null) => void;
}

const PresenceContext = createContext<PresenceContextValue>({
  presence: EMPTY_PRESENCE,
  setTyping: () => {},
});

/** While you're signed in and have the app open, others see you as online (green dot). */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const [presence, setPresence] = useState<{ userId: string; snapshot: PresenceSnapshot }>();

  useEffect(
    () =>
      userId
        ? presenceService.join(userId, (snapshot) => setPresence({ userId, snapshot }))
        : undefined,
    [userId],
  );

  return (
    <PresenceContext.Provider
      value={{
        presence: presence && presence.userId === userId ? presence.snapshot : EMPTY_PRESENCE,
        setTyping: presenceService.setTyping,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
