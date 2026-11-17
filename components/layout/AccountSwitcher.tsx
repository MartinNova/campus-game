"use client";

import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { fullName } from "@/types/user";

/**
 * Demo login: pick which account you are. Replaced by real Supabase Auth later.
 */
export function AccountSwitcher() {
  const { user, users, switchUser } = useCurrentUser();

  if (!user) return <div className="bg-border h-9 w-40 animate-pulse rounded-xl" />;

  const team = users.filter((u) => u.role === "team");
  const demo = users.filter((u) => u.role === "demo");

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Signed in as</span>
      <span
        aria-hidden
        className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      >
        {user.firstName[0]}
        {user.lastName[0]}
      </span>
      <select
        value={user.id}
        onChange={(e) => switchUser(e.target.value)}
        className="border-border bg-surface focus-visible:outline-brand h-9 max-w-44 truncate rounded-xl border px-2 focus-visible:outline-2"
      >
        <optgroup label="Team">
          {team.map((u) => (
            <option key={u.id} value={u.id}>
              {fullName(u)} ({u.studentId})
            </option>
          ))}
        </optgroup>
        <optgroup label="Demo students">
          {demo.map((u) => (
            <option key={u.id} value={u.id}>
              {fullName(u)} ({u.studentId})
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
