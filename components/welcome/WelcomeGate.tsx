"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { isGuest, setGuest, subscribeToGuest } from "@/lib/welcome/guest";
import { WelcomeScreen } from "./WelcomeScreen";

/** Sign-in pages stay reachable, otherwise nobody could get past the welcome screen. */
const OPEN_ROUTES = ["/login", "/auth", "/reset-password"];

/**
 * Shows the welcome screen instead of the app to signed-out visitors (real accounts only),
 * until they sign in or tap "Look around first". The demo login never sees it.
 */
export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, ready, mode } = useCurrentUser();
  // The choice is stored on the device, so it is only known in the browser.
  const guest = useSyncExternalStore(subscribeToGuest, isGuest, () => false);

  // Signed in: forget the guest choice, so signing out shows the welcome screen again.
  useEffect(() => {
    if (user) setGuest(false);
  }, [user]);

  const open = OPEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const gated = mode === "accounts" && !open && !guest && !user;

  // The app always renders (Next.js validates every page), but stays hidden while gated.
  // Until the session is known, nothing shows, so the app doesn't flash before the welcome.
  return (
    <>
      {gated && ready && <WelcomeScreen />}
      <div className={gated ? "hidden" : "contents"}>{children}</div>
    </>
  );
}
