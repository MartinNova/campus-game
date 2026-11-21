"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  PASSWORD_MIN_LENGTH,
  normalizeUsername,
  validatePassword,
  validateUsername,
} from "@/lib/profile/profile-rules";
import { authService } from "@/lib/services/auth.service";
import { MICROSOFT_LOGIN_ENABLED } from "@/lib/supabase/config";

type Tab = "signin" | "signup";

/** Messages for ?login_error=... set by app/auth/callback/route.ts. */
const LOGIN_ERRORS: Record<string, string> = {
  not_allowed: "This e-mail address can't be used for this app.",
  exchange_failed: "The link didn't work or has expired. Please sign in again.",
  missing_code: "The link didn't work or has expired. Please sign in again.",
};

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-11 w-full rounded-xl border px-3 text-base focus-visible:outline-2";

/** Sign in / create account with e-mail and password. */
export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const loginError = params.get("login_error");
  // Where to go after signing in (only paths inside the app), e.g. "/" from the welcome screen.
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/profile";
  const { user, ready, mode, refresh } = useCurrentUser();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameHint, setUsernameHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    loginError ? (LOGIN_ERRORS[loginError] ?? LOGIN_ERRORS.exchange_failed) : null,
  );
  const [busy, setBusy] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);
  // "Forgot password?": null = normal form, "form" = ask for the e-mail, "sent" = link sent.
  const [reset, setReset] = useState<null | "form" | "sent">(null);

  // Already signed in: go straight to your area.
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  if (mode === "demo" || !authService) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Demo mode</p>
        <p className="text-muted mt-1 text-sm">
          Accounts need Supabase (see <code className="font-mono">docs/accounts.md</code>). Until
          then, pick a demo account in the header.
        </p>
      </Card>
    );
  }
  const auth = authService;

  if (checkInbox) {
    return (
      <Card className="flex flex-col items-center gap-2 py-8 text-center">
        <MailCheck className="text-brand size-8" aria-hidden />
        <p className="font-semibold">Check your inbox</p>
        <p className="text-muted max-w-xs text-sm">
          We sent a link to <strong>{email}</strong>. Open it to confirm your account, then you are
          signed in.
        </p>
      </Card>
    );
  }

  if (reset === "sent") {
    return (
      <Card className="flex flex-col items-center gap-2 py-8 text-center">
        <MailCheck className="text-brand size-8" aria-hidden />
        <p className="font-semibold">Check your inbox</p>
        <p className="text-muted max-w-xs text-sm">
          If there is an account for <strong>{email}</strong>, we sent a link to set a new password.
          It can take a minute; check your spam folder too.
        </p>
        <Button variant="ghost" onClick={() => setReset(null)}>
          Back to sign in
        </Button>
      </Card>
    );
  }

  if (reset === "form") {
    return (
      <Card>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setBusy(true);
            try {
              await auth.requestPasswordReset(email);
              setReset("sent");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Something went wrong.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <p className="font-semibold">Forgot your password?</p>
            <p className="text-muted text-sm">
              Enter your e-mail and we&apos;ll send you a link to set a new one.
            </p>
          </div>
          <label className="text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="h-11">
            Send reset link
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setError(null);
              setReset(null);
            }}
          >
            Back to sign in
          </Button>
        </form>
      </Card>
    );
  }

  async function checkUsername() {
    const name = normalizeUsername(username);
    if (!name) return setUsernameHint(null);
    const invalid = validateUsername(name);
    if (invalid) return setUsernameHint(invalid);
    const free = await auth.isUsernameAvailable(name).catch(() => true);
    setUsernameHint(free ? null : "This username is already taken.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "signin") {
        await auth.signIn(email, password);
      } else {
        const name = normalizeUsername(username);
        const problem = validateUsername(name) ?? validatePassword(password);
        if (problem) throw new Error(problem);
        if (!(await auth.isUsernameAvailable(name))) {
          throw new Error("This username is already taken.");
        }
        const { needsConfirmation } = await auth.signUp({ email, password, username: name });
        if (needsConfirmation) {
          setCheckInbox(true);
          return;
        }
      }
      await refresh();
      // New accounts first fill in their profile; returning users go where they came from.
      router.push(tab === "signup" ? "/onboarding" : next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div role="tablist" className="bg-background mb-5 grid grid-cols-2 gap-1 rounded-xl p-1">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setError(null);
            }}
            className={`h-9 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="text-sm font-medium">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>

        {tab === "signup" && (
          <label className="text-sm font-medium">
            Username
            <div className="relative">
              <span className="text-muted pointer-events-none absolute top-1/2 left-3 mt-0.5 -translate-y-1/2">
                @
              </span>
              <input
                required
                autoComplete="username"
                autoCapitalize="none"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameHint(null);
                }}
                onBlur={() => void checkUsername()}
                placeholder="till.f"
                className={`${fieldClass} pl-7`}
              />
            </div>
            <span
              className={`mt-1 block text-xs ${usernameHint ? "text-red-700 dark:text-red-400" : "text-muted"}`}
            >
              {usernameHint ?? "3–20 characters: letters, numbers, _ and ."}
            </span>
          </label>
        )}

        <label className="text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={tab === "signup" ? PASSWORD_MIN_LENGTH : undefined}
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
          {tab === "signup" && (
            <span className="text-muted mt-1 block text-xs">
              At least {PASSWORD_MIN_LENGTH} characters.
            </span>
          )}
        </label>
        {tab === "signin" && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setReset("form");
            }}
            className="text-brand -mt-2 justify-self-start text-sm underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="h-11">
          {tab === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {MICROSOFT_LOGIN_ENABLED && (
        <>
          <p className="text-muted my-4 text-center text-xs">or</p>
          <Button
            variant="secondary"
            className="h-11 w-full"
            onClick={() => void auth.signInWithMicrosoft().catch((e: Error) => setError(e.message))}
          >
            Sign in with Microsoft (Nova account)
          </Button>
        </>
      )}

      {tab === "signup" && (
        <p className="text-muted mt-4 text-center text-xs">
          You can add your picture, programme and more in{" "}
          <Link href="/settings" className="underline">
            settings
          </Link>{" "}
          afterwards.
        </p>
      )}
    </Card>
  );
}
