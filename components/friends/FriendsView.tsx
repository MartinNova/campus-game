"use client";

import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { flagEmoji, studyProgress } from "@/lib/profile/profile-rules";
import { profileService } from "@/lib/services/profile.service";
import { NOVA_PROGRAMS, SPORT_INTERESTS, type Profile } from "@/types/profile";

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

/** True if the profile matches the search text (name or @username). */
function matchesSearch(p: Profile, text: string): boolean {
  const q = text.trim().toLowerCase().replace(/^@/, "");
  if (!q) return true;
  return `${p.firstName} ${p.lastName} ${p.username}`.toLowerCase().includes(q);
}

/** The Friends module: every student with a public profile, with filters. */
export function FriendsView() {
  const { user, ready, mode } = useCurrentUser();
  const userId = user?.id;
  const [loaded, setLoaded] = useState<{ profiles: Profile[]; today: string } | null>(null);
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [sport, setSport] = useState("");

  useEffect(() => {
    if (!userId) return;
    profileService
      .listProfiles()
      .catch(() => [])
      .then((profiles) => setLoaded({ profiles, today: new Date().toISOString().slice(0, 7) }));
  }, [userId]);

  const others = useMemo(
    () => (loaded?.profiles ?? []).filter((p) => p.userId !== userId),
    [loaded, userId],
  );
  const shown = others.filter(
    (p) =>
      matchesSearch(p, search) &&
      (!program || p.program === program) &&
      (!sport || p.sports.includes(sport)),
  );

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;

  if (!user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <Users className="text-brand size-8" aria-hidden />
        <p className="font-semibold">Meet other Nova students</p>
        <p className="text-muted max-w-xs text-sm">
          Sign in to see who else is on the app and get in touch.
        </p>
        <Link
          href="/login"
          className="bg-brand text-brand-foreground inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium hover:opacity-90"
        >
          Sign in or create account
        </Link>
      </Card>
    );
  }

  return (
    <>
      {mode === "demo" && (
        <p className="text-muted mb-4 text-sm">
          Demo mode: these are the demo accounts. With real accounts you see everyone on the app.
        </p>
      )}

      <div className="mb-4 grid gap-2">
        <label className="relative">
          <span className="sr-only">Search by name or username</span>
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or @username"
            className={`${fieldClass} pl-9`}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Programme"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className={fieldClass}
          >
            <option value="">All programmes</option>
            {Object.entries(NOVA_PROGRAMS).map(([group, programs]) => (
              <optgroup key={group} label={group}>
                {programs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            aria-label="Sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className={fieldClass}
          >
            <option value="">All sports</option>
            {SPORT_INTERESTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loaded ? (
        <div className="bg-border h-40 animate-pulse rounded-2xl" aria-busy="true" />
      ) : shown.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="font-semibold">
            {others.length === 0 ? "You're the first one here" : "Nobody matches these filters"}
          </p>
          <p className="text-muted mt-1 text-sm">
            {others.length === 0
              ? "Invite your classmates to create an account."
              : "Try another programme or sport."}
          </p>
        </Card>
      ) : (
        <ul className="grid gap-2">
          {shown.map((p) => (
            <li key={p.userId}>
              <Link
                href={`/friends/${p.username}`}
                className="border-border bg-surface hover:border-brand flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition-colors"
              >
                <Avatar
                  firstName={p.firstName}
                  lastName={p.lastName}
                  username={p.username}
                  url={p.avatarUrl}
                  size={48}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {[p.firstName, p.lastName].filter(Boolean).join(" ") || `@${p.username}`}{" "}
                    {flagEmoji(p.country)}
                  </span>
                  <span className="text-muted block truncate text-sm">
                    {[p.program, studyProgress(p.studyStart, p.studyEnd, loaded.today)]
                      .filter(Boolean)
                      .join(" · ") || `@${p.username}`}
                  </span>
                </span>
                {p.sports.length > 0 && (
                  <span className="hidden sm:block">
                    <Badge tone="brand">{p.sports[0]}</Badge>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
