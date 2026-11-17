"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { userService } from "@/lib/services/user.service";
import type { User } from "@/types/user";

interface CurrentUserContextValue {
  user: User | null;
  users: User[];
  switchUser: (userId: string) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

/** Makes the logged-in (demo) user available everywhere via `useCurrentUser()`. */
export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([userService.listUsers(), userService.getCurrentUser()]).then(([all, current]) => {
      setUsers(all);
      setUser(current);
    });
  }, []);

  const switchUser = useCallback(
    (userId: string) => {
      const next = users.find((u) => u.id === userId);
      if (!next) return;
      setUser(next);
      void userService.setCurrentUser(userId);
    },
    [users],
  );

  return (
    <CurrentUserContext.Provider value={{ user, users, switchUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside <CurrentUserProvider>");
  return ctx;
}
