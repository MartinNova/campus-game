"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService, userService } from "@/lib/services/user.service";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { User } from "@/types/user";

interface CurrentUserContextValue {
  /** null = signed out (Microsoft mode) or still loading (see `ready`). */
  user: User | null;
  users: User[];
  /** False until the first load finished, so we don't flash "Sign in". */
  ready: boolean;
  /** "demo" = account switcher, "microsoft" = real Nova sign-in. */
  mode: typeof AUTH_MODE;
  switchUser: (userId: string) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Reload user data, e.g. after the profile was saved. */
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

async function loadUsers() {
  const [all, current] = await Promise.all([
    userService.listUsers().catch(() => []),
    userService.getCurrentUser().catch(() => null),
  ]);
  return { all, current };
}

/** Makes the logged-in user available everywhere via `useCurrentUser()`. */
export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(
    () =>
      loadUsers().then(({ all, current }) => {
        setUsers(all);
        setUser(current);
        setReady(true);
      }),
    [],
  );

  useEffect(() => {
    loadUsers().then(({ all, current }) => {
      setUsers(all);
      setUser(current);
      setReady(true);
    });
    return authService?.onChange(() => void refresh());
  }, [refresh]);

  const switchUser = useCallback(
    (userId: string) => {
      const next = users.find((u) => u.id === userId);
      if (!next) return;
      setUser(next);
      void userService.setCurrentUser(userId);
    },
    [users],
  );

  const signIn = useCallback(async () => {
    await authService?.signInWithMicrosoft();
  }, []);

  const signOut = useCallback(async () => {
    await authService?.signOut();
    await refresh();
  }, [refresh]);

  return (
    <CurrentUserContext.Provider
      value={{ user, users, ready, mode: AUTH_MODE, switchUser, signIn, signOut, refresh }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside <CurrentUserProvider>");
  return ctx;
}
