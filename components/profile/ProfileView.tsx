"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { profileService } from "@/lib/services/profile.service";
import type { Profile, ProfileUpdate } from "@/types/profile";
import { ProfileForm } from "./ProfileForm";

/** Messages for ?login_error=... set by app/auth/callback/route.ts. */
const LOGIN_ERRORS: Record<string, string> = {
  not_nova: "Only Nova SBE accounts (@novasbe.pt) can sign in.",
  exchange_failed: "Sign-in didn't work. Please try again.",
  missing_code: "Sign-in didn't work. Please try again.",
};

/** Result of loading one user's profile; `userId` tells which user it belongs to. */
type Loaded = { userId: string; profile: Profile | null; error?: string };

export function ProfileView() {
  const { user, ready, mode, signIn, signOut, refresh } = useCurrentUser();
  const loginError = useSearchParams().get("login_error");
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    profileService
      .getProfile(userId)
      .then((profile) => setLoaded({ userId, profile }))
      .catch((err: unknown) =>
        setLoaded({
          userId,
          profile: null,
          error: err instanceof Error ? err.message : "Could not load your profile.",
        }),
      );
  }, [user]);

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;

  if (!user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="font-semibold">Sign in with your Nova account</p>
        <p className="text-muted max-w-xs text-sm">
          Use your @novasbe.pt Microsoft 365 login. We only read your name and e-mail.
        </p>
        {loginError && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {LOGIN_ERRORS[loginError] ?? LOGIN_ERRORS.exchange_failed}
          </p>
        )}
        <Button onClick={() => void signIn()}>Sign in with Microsoft</Button>
      </Card>
    );
  }

  // Loading is derived: the last result belongs to another user (or nothing loaded yet).
  const current = loaded?.userId === user.id ? loaded : null;

  async function handleSave(update: ProfileUpdate) {
    const saved = await profileService.updateProfile(user!.id, update);
    setLoaded({ userId: saved.userId, profile: saved });
    await refresh();
  }

  return (
    <>
      {mode === "demo" && (
        <p className="text-muted mb-4 text-sm">
          Demo mode: this profile is stored in your browser. With Microsoft sign-in it is saved for
          everyone (see <code className="font-mono">docs/microsoft-login.md</code>).
        </p>
      )}

      {!current ? (
        <div className="bg-border h-64 animate-pulse rounded-2xl" aria-busy="true" />
      ) : !current.profile ? (
        <Card className="text-center">
          <p className="font-semibold">Profile unavailable</p>
          <p className="text-muted mt-1 text-sm">{current.error ?? "No profile found."}</p>
        </Card>
      ) : (
        <ProfileForm key={user.id} profile={current.profile} onSave={handleSave} />
      )}

      {mode === "microsoft" && (
        <Button variant="ghost" className="mt-6" onClick={() => void signOut()}>
          Sign out
        </Button>
      )}
    </>
  );
}
