"use client";

import { AtSign, Briefcase, Trophy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Card } from "@/components/ui/Card";
import { profileService } from "@/lib/services/profile.service";
import type { Profile } from "@/types/profile";

type Loaded = { username: string; profile: Profile | null; today: string };

const linkClass =
  "border-border bg-surface hover:border-brand inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium";

/** Another student's profile with ways to get in touch. */
export function FriendProfileView() {
  const username = useSearchParams().get("u") ?? "";
  const { user, ready } = useCurrentUser();
  const userId = user?.id;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!userId) return;
    profileService
      .getProfileByUsername(username)
      .catch(() => null)
      .then((profile) =>
        setLoaded({ username, profile, today: new Date().toISOString().slice(0, 7) }),
      );
  }, [username, userId]);

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;

  if (!user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Sign in to see profiles</p>
        <Link href="/login" className="text-brand mt-2 inline-block text-sm underline">
          Sign in or create account
        </Link>
      </Card>
    );
  }

  const current = loaded?.username === username ? loaded : null;
  if (!current)
    return <div className="bg-border h-64 animate-pulse rounded-2xl" aria-busy="true" />;

  const p = current.profile;
  if (!p) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Profile not found</p>
        <p className="text-muted mt-1 text-sm">It may be private or the account was deleted.</p>
      </Card>
    );
  }

  const isMe = p.userId === user.id;

  return (
    <div className="grid gap-4">
      <ProfileCard profile={p} today={current.today} />

      {isMe ? (
        <Link href="/settings" className={linkClass}>
          This is you · Edit profile
        </Link>
      ) : (
        <Card className="grid gap-3">
          <p className="font-semibold">Get in touch with {p.firstName || `@${p.username}`}</p>
          <div className="flex flex-wrap gap-2">
            {p.instagram && (
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <AtSign className="size-4" aria-hidden /> Instagram
              </a>
            )}
            {p.linkedin && (
              <a href={p.linkedin} target="_blank" rel="noreferrer" className={linkClass}>
                <Briefcase className="size-4" aria-hidden /> LinkedIn
              </a>
            )}
            {p.sports.includes("Padel") && (
              <Link href="/sport/padel" className={linkClass}>
                <Trophy className="size-4" aria-hidden /> Find a padel match
              </Link>
            )}
          </div>
          {!p.instagram && !p.linkedin && (
            <p className="text-muted text-sm">
              No contact links yet. Direct messages are coming next.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
