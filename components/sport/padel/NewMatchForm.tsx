"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PADEL_CLUBS, playtomicUrlFor } from "@/lib/padel/clubs";
import { MAX_PADEL_PLAYERS, PADEL_LEVELS, getLevelBand, type NewPadelMatch } from "@/types/padel";

const OTHER = "__other";
const DURATIONS = [60, 90, 120];

interface NewMatchFormProps {
  initialDate: string;
  minDate: string;
  onSubmit: (input: NewPadelMatch) => Promise<void>;
  onClose: () => void;
}

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

/** "I booked a court and need players": form to post a match. */
export function NewMatchForm({ initialDate, minDate, onSubmit, onClose }: NewMatchFormProps) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("18:00");
  const [durationMinutes, setDuration] = useState(90);
  const [club, setClub] = useState(PADEL_CLUBS[0].name);
  const [otherLocation, setOtherLocation] = useState("");
  const [level, setLevel] = useState(2.5);
  const [needed, setNeeded] = useState(3);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const location = club === OTHER ? otherLocation : club;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        time,
        durationMinutes,
        location,
        level,
        maxPlayers: MAX_PADEL_PLAYERS,
        guestCount: MAX_PADEL_PLAYERS - 1 - needed,
        description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the match.");
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <h2 className="font-semibold">Post your court</h2>
          <p className="text-muted text-sm">
            Booked a court? Tell others when and how many players you still need.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Date
            <input
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-medium">
            Start
            <input
              type="time"
              required
              step={900}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        <label className="text-sm font-medium">
          Club
          <select value={club} onChange={(e) => setClub(e.target.value)} className={fieldClass}>
            {PADEL_CLUBS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value={OTHER}>Other court…</option>
          </select>
        </label>
        {club === OTHER && (
          <label className="text-sm font-medium">
            Court name
            <input
              required
              value={otherLocation}
              onChange={(e) => setOtherLocation(e.target.value)}
              placeholder="e.g. Nova SBE campus court"
              className={fieldClass}
            />
          </label>
        )}
        <a
          href={playtomicUrlFor(location)}
          target="_blank"
          rel="noreferrer"
          className="text-brand -mt-2 inline-flex items-center gap-1 text-sm underline"
        >
          Not booked yet? Book this court on Playtomic{" "}
          <ExternalLink className="size-3.5" aria-hidden />
        </a>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Duration
            <select
              value={durationMinutes}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={fieldClass}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Level
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className={fieldClass}
            >
              {PADEL_LEVELS.map((band) => (
                <option key={band.min} value={band.min}>
                  {band.min.toFixed(1)}–{band.max.toFixed(1)} {band.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-muted -mt-2 text-xs">{getLevelBand(level).description}</p>

        <fieldset>
          <legend className="text-sm font-medium">Players needed</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                variant={needed === n ? "primary" : "secondary"}
                aria-pressed={needed === n}
                onClick={() => setNeeded(n)}
              >
                {n}
              </Button>
            ))}
          </div>
          <p className="text-muted mt-1 text-xs">
            You + {MAX_PADEL_PLAYERS - 1 - needed} friend
            {MAX_PADEL_PLAYERS - 1 - needed === 1 ? "" : "s"} already in, {needed} open spot
            {needed > 1 ? "s" : ""}.
          </p>
        </fieldset>

        <label className="text-sm font-medium">
          Note (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="e.g. Friendly game, rackets available"
            className="border-border bg-surface focus-visible:outline-brand mt-1 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-2"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            Post match
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
