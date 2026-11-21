"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { presenceService } from "@/lib/services/presence.service";

const OnlineContext = createContext<Set<string>>(new Set());

/** Marks you as online while the app is open and shares who else is online. */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const [online, setOnline] = useState<Set<string>>(() => new Set());

  useEffect(() => (userId ? presenceService.goOnline(userId, setOnline) : undefined), [userId]);

  return (
    <OnlineContext.Provider value={userId ? online : new Set()}>{children}</OnlineContext.Provider>
  );
}

/** True while this student has the app open. */
export function useIsOnline(userId: string | undefined): boolean {
  const online = useContext(OnlineContext);
  return !!userId && online.has(userId);
}
