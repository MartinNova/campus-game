"use client";

import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { checkNewPassword } from "@/lib/auth/password-reset";
import { PASSWORD_MIN_LENGTH } from "@/lib/profile/profile-rules";
import { authService } from "@/lib/services/auth.service";

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-11 w-full rounded-xl border px-3 text-base focus-visible:outline-2";

/**
 * Set a new password after opening the link from the reset e-mail.
 * The link already signed you in (app/auth/callback), so this just changes the password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const { user, ready } = useCurrentUser();
  const [password, setPassword] = useState("");
  const [repeated, setRepeated] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;

  if (!authService || !user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">This link has expired</p>
        <p className="text-muted mt-1 text-sm">
          Reset links work once and only for a short time. Ask for a new one on the sign-in page.
        </p>
        <Link href="/login" className="text-brand mt-3 inline-block text-sm underline">
          Go to sign in
        </Link>
      </Card>
    );
  }
  const auth = authService;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = checkNewPassword(password, repeated);
    if (problem) return setError(problem);
    setError(null);
    setBusy(true);
    try {
      await auth.changePassword(password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the new password.");
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound className="text-brand size-5" aria-hidden /> Choose a new password
        </p>
        <label className="text-sm font-medium">
          New password
          <input
            type="password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
          <span className="text-muted mt-1 block text-xs">
            At least {PASSWORD_MIN_LENGTH} characters.
          </span>
        </label>
        <label className="text-sm font-medium">
          Repeat new password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={repeated}
            onChange={(e) => setRepeated(e.target.value)}
            className={fieldClass}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="h-11">
          Save new password
        </Button>
      </form>
    </Card>
  );
}
