"use client";

import { useIsOnline } from "./PresenceProvider";

/** Green dot on a profile picture while the student has the app open. */
export function OnlineDot({ userId, children }: { userId: string; children: React.ReactNode }) {
  const online = useIsOnline(userId);
  return (
    <span className="relative inline-flex shrink-0">
      {children}
      {online && (
        <span
          className="ring-surface absolute right-0 bottom-0 size-3 rounded-full bg-green-500 ring-2"
          title="Online"
        >
          <span className="sr-only">online</span>
        </span>
      )}
    </span>
  );
}
