"use client";

import Link from "next/link";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/Button";
import { fullName, type User } from "@/types/user";

/** Round initials badge that opens the profile page. */
function Avatar({ user }: { user: User }) {
  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      className="bg-brand text-brand-foreground focus-visible:outline-brand flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold focus-visible:outline-2"
    >
      {user.firstName[0]}
      {user.lastName[0]}
    </Link>
  );
}

/**
 * Header account area.
 * Microsoft mode: "Sign in" button, or your avatar once signed in.
 * Demo mode: pick which mock account you are.
 */
export function AccountSwitcher() {
  const { user, users, ready, mode, switchUser, signIn } = useCurrentUser();

  if (!ready) return <div className="bg-border h-9 w-40 animate-pulse rounded-xl" />;

  if (mode === "microsoft") {
    if (!user) {
      return (
        <Button variant="secondary" className="h-9" onClick={() => void signIn()}>
          Sign in with Microsoft
        </Button>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="max-w-32 truncate">{user.firstName}</span>
        <Avatar user={user} />
      </div>
    );
  }

  if (!user) return null;
  const team = users.filter((u) => u.role === "team");
  const demo = users.filter((u) => u.role === "demo");

  return (
    <div className="flex items-center gap-2 text-sm">
      <Avatar user={user} />
      <label>
        <span className="sr-only">Signed in as</span>
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
    </div>
  );
}
