"use client";

import { Camera, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { squareAvatar } from "@/lib/profile/avatar";
import {
  ONBOARDING_STEPS,
  applyOnboarding,
  checkOnboardingStep,
  type OnboardingAnswers,
} from "@/lib/profile/onboarding";
import { profileService } from "@/lib/services/profile.service";
import { celebrate } from "@/lib/ui/confetti";
import { PADEL_LEVELS } from "@/types/padel";
import { NOVA_PROGRAMS, SPORT_INTERESTS, type Profile } from "@/types/profile";

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-11 w-full rounded-xl border px-3 text-base focus-visible:outline-2";

const chip = (on: boolean) =>
  `flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-95 ${
    on ? "border-brand bg-brand text-brand-foreground" : "border-border bg-surface"
  }`;

/**
 * Three short steps right after sign-up: picture + name, programme, sports.
 * So every profile in Friends, Padel and Chat has a face, a programme and interests.
 */
export function OnboardingFlow() {
  const router = useRouter();
  const toast = useToast();
  const { user, ready, refresh } = useCurrentUser();
  const userId = user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userId) return;
    void profileService.getProfile(userId).then((p) => {
      if (!p) return;
      setProfile(p);
      setAnswers({
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
        program: p.program,
        sports: p.sports,
        padelLevel: p.padelLevel,
      });
    });
  }, [userId]);

  if (ready && !user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Sign in first</p>
        <Link href="/login" className="text-brand mt-2 inline-block text-sm underline">
          Go to sign in
        </Link>
      </Card>
    );
  }
  if (!user || !profile || !answers) {
    return <div className="bg-border h-80 animate-pulse rounded-3xl" aria-busy="true" />;
  }

  // Functional updates, so quick taps in a row never overwrite each other.
  const set = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) =>
    setAnswers((a) => (a ? { ...a, [key]: value } : a));
  const toggleSport = (sport: string) =>
    setAnswers((a) =>
      a
        ? {
            ...a,
            sports: a.sports.includes(sport)
              ? a.sports.filter((x) => x !== sport)
              : [...a.sports, sport],
          }
        : a,
    );

  async function pickPhoto(file: File | undefined) {
    if (!file || !userId) return;
    setBusy(true);
    setError(null);
    try {
      set("avatarUrl", await profileService.uploadAvatar(userId, await squareAvatar(file)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the picture.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function next() {
    if (!answers || !profile) return;
    const problem = checkOnboardingStep(step, answers);
    if (problem) return setError(problem);
    setError(null);
    if (step < ONBOARDING_STEPS.length - 1) return setStep(step + 1);

    setBusy(true);
    try {
      await profileService.updateProfile(profile.userId, applyOnboarding(profile, answers));
      await refresh();
      celebrate();
      toast(`Welcome to Nova Life, ${answers.firstName.trim()}!`);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5">
      {/* Progress: one bar per step. */}
      <div className="grid grid-cols-3 gap-2" aria-label={`Step ${step + 1} of 3`}>
        {ONBOARDING_STEPS.map((label, i) => (
          <div key={label} className="grid gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-muted/25"}`}
            />
            <span
              className={`text-xs ${i === step ? "text-foreground font-semibold" : "text-muted"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <Card key={step} className="page-in grid gap-5">
        {step === 0 && (
          <>
            <div>
              <h2 className="text-xl font-bold">Who are you?</h2>
              <p className="text-muted text-sm">A photo helps others recognise you on campus.</p>
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="relative justify-self-center rounded-full"
              aria-label="Choose a profile picture"
            >
              <Avatar
                firstName={answers.firstName || "?"}
                lastName={answers.lastName}
                username={user.username}
                url={answers.avatarUrl}
                size={112}
              />
              <span className="bg-brand text-brand-foreground ring-surface absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full ring-4">
                <Camera className="size-4" aria-hidden />
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void pickPhoto(e.target.files?.[0])}
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                First name
                <input
                  value={answers.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  autoComplete="given-name"
                  maxLength={50}
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-medium">
                Last name
                <input
                  value={answers.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  autoComplete="family-name"
                  maxLength={50}
                  className={fieldClass}
                />
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-xl font-bold">What do you study?</h2>
              <p className="text-muted text-sm">Find classmates from your programme.</p>
            </div>
            {Object.entries(NOVA_PROGRAMS).map(([group, programs]) => (
              <fieldset key={group} className="grid gap-2">
                <legend className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                  {group}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {programs.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={answers.program === p}
                      onClick={() => set("program", answers.program === p ? "" : p)}
                      className={chip(answers.program === p)}
                    >
                      {answers.program === p && <Check className="size-4" aria-hidden />}
                      {p}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-bold">What do you like to play?</h2>
              <p className="text-muted text-sm">
                We&apos;ll show you matches and people to play with.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPORT_INTERESTS.map((s) => {
                const on = answers.sports.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSport(s)}
                    className={chip(on)}
                  >
                    {on && <Check className="size-4" aria-hidden />}
                    {s}
                  </button>
                );
              })}
            </div>
            {answers.sports.includes("Padel") && (
              <label className="text-sm font-medium">
                Your padel level
                <select
                  value={answers.padelLevel ?? ""}
                  onChange={(e) =>
                    set("padelLevel", e.target.value === "" ? null : Number(e.target.value))
                  }
                  className={fieldClass}
                >
                  <option value="">Not sure yet</option>
                  {PADEL_LEVELS.map((band) => (
                    <option key={band.min} value={band.min}>
                      {band.min.toFixed(1)}–{band.max.toFixed(1)} {band.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={busy}>
              Back
            </Button>
          )}
          <Button className="h-11 flex-1" onClick={() => void next()} disabled={busy}>
            {step < ONBOARDING_STEPS.length - 1 ? "Continue" : "Let's go"}
          </Button>
        </div>
      </Card>

      <Link
        href="/"
        className="text-muted justify-self-center text-sm underline-offset-4 hover:underline"
      >
        Skip for now
      </Link>
    </div>
  );
}
