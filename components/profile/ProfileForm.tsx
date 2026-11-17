"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PADEL_LEVELS } from "@/types/padel";
import {
  BIO_MAX_LENGTH,
  PROGRAMS,
  SPORT_INTERESTS,
  type Profile,
  type ProfileUpdate,
} from "@/types/profile";

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

interface ProfileFormProps {
  profile: Profile;
  onSave: (update: ProfileUpdate) => Promise<void>;
}

/** Editable part of the profile. E-mail and student number are shown but come from Microsoft. */
export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileUpdate>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    program: profile.program,
    sports: profile.sports,
    padelLevel: profile.padelLevel,
    bio: profile.bio,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus("idle");
  };

  const toggleSport = (sport: string) =>
    set(
      "sports",
      form.sports.includes(sport)
        ? form.sports.filter((s) => s !== sport)
        : [...form.sports, sport],
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await onSave(form);
      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Card className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            First name
            <input
              required
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        {(profile.email || profile.studentId) && (
          <dl className="text-muted grid grid-cols-2 gap-3 text-sm">
            {profile.email && (
              <div className="min-w-0">
                <dt className="text-foreground font-medium">Nova e-mail</dt>
                <dd className="truncate">{profile.email}</dd>
              </div>
            )}
            {profile.studentId && (
              <div>
                <dt className="text-foreground font-medium">Student number</dt>
                <dd>{profile.studentId}</dd>
              </div>
            )}
          </dl>
        )}

        <label className="text-sm font-medium">
          Programme
          <select
            value={form.program}
            onChange={(e) => set("program", e.target.value)}
            className={fieldClass}
          >
            <option value="">Not set</option>
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium">
          About you
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            maxLength={BIO_MAX_LENGTH}
            rows={3}
            placeholder="e.g. Exchange student from Germany, looking for padel and surf buddies"
            className="border-border bg-surface focus-visible:outline-brand mt-1 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-2"
          />
          <span className="text-muted block text-right text-xs">
            {form.bio.length}/{BIO_MAX_LENGTH}
          </span>
        </label>
      </Card>

      <Card className="grid gap-4">
        <fieldset>
          <legend className="text-sm font-medium">Sports you like</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPORT_INTERESTS.map((sport) => {
              const on = form.sports.includes(sport);
              return (
                <button
                  key={sport}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSport(sport)}
                  className={`focus-visible:outline-brand rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                    on
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-surface hover:border-brand"
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="text-sm font-medium">
          Padel level
          <select
            value={form.padelLevel ?? ""}
            onChange={(e) =>
              set("padelLevel", e.target.value === "" ? null : Number(e.target.value))
            }
            className={fieldClass}
          >
            <option value="">Not set</option>
            {PADEL_LEVELS.map((band) => (
              <option key={band.min} value={band.min}>
                {band.min.toFixed(1)}–{band.max.toFixed(1)} {band.label}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          Save profile
        </Button>
        {status === "saved" && (
          <span role="status" className="text-sm text-green-700 dark:text-green-400">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
