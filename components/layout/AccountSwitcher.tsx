"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { fullName, type User } from "@/types/user";

/** Profile picture (opens your area) and gear icon (opens settings). */
function AccountLinks({ user }: { user: User }) {
  return (
    <>
      <Link
        href="/settings"
        aria-label="Settings"
        className="text-muted hover:text-foreground focus-visible:outline-brand flex size-9 items-center justify-center rounded-full focus-visible:outline-2"
      >
        <Settings className="size-5" aria-hidden />
      </Link>
      <Link
        href="/profile"
        aria-label="Your profile"
        className="focus-visible:outline-brand rounded-full focus-visible:outline-2"
      >
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          username={user.username}
          url={user.avatarUrl}
          size={36}
        />
      </Link>
    </>
  );
}

/**
 * Header account area.
 * Accounts mode: "Sign in" when signed out, otherwise settings + your picture.
 * Demo mode: additionally pick which mock account you are.
 */
export function AccountSwitcher() {
  const { user, users, ready, mode, switchUser } = useCurrentUser();

  if (!ready) return <div className="bg-border h-9 w-28 animate-pulse rounded-xl" />;

  if (mode === "accounts") {
    if (!user) {
      return (
        <Link
          href="/login"
          className="bg-brand text-brand-foreground inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium hover:opacity-90"
        >
          Sign in
        </Link>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <AccountLinks user={user} />
      </div>
    );
  }

  if (!user) return null;
  const team = users.filter((u) => u.role === "team");
  const demo = users.filter((u) => u.role === "demo");

  return (
    <div className="flex items-center gap-1 text-sm">
      <label>
        <span className="sr-only">Demo account</span>
        <select
          value={user.id}
          onChange={(e) => switchUser(e.target.value)}
          className="border-border bg-surface focus-visible:outline-brand mr-1 h-9 max-w-36 truncate rounded-xl border px-2 focus-visible:outline-2"
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
      <AccountLinks user={user} />
    </div>
  );
}
