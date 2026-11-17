"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RUN_MEETING_POINTS } from "@/data/running-clubs";
import { estimateMinutes, formatDuration, formatPace } from "@/lib/running/runs";
import {
  RUN_DIFFICULTIES,
  RUN_LEVELS,
  RUN_PACES,
  type NewRun,
  type RunDifficulty,
  type RunLevel,
} from "@/types/running";

const OTHER = "__other";

interface NewRunFormProps {
  initialDate: string;
  minDate: string;
  onSubmit: (input: NewRun) => Promise<void>;
  onClose: () => void;
}

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

/** "I'm going for a run, join me": form to post a run. */
export function NewRunForm({ initialDate, minDate, onSubmit, onClose }: NewRunFormProps) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("18:30");
  const [place, setPlace] = useState(RUN_MEETING_POINTS[0]);
  const [otherLocation, setOtherLocation] = useState("");
  const [distanceKm, setDistanceKm] = useState(5);
  const [paceSecPerKm, setPace] = useState(330);
  const [level, setLevel] = useState<RunLevel>("intermediate");
  const [difficulty, setDifficulty] = useState<RunDifficulty>("moderate");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const location = place === OTHER ? otherLocation : place;
  const validDistance = Number.isFinite(distanceKm) && distanceKm > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        time,
        location,
        distanceKm,
        paceSecPerKm,
        level,
        difficulty,
        description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the run.");
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <h2 className="font-semibold">Post your run</h2>
          <p className="text-muted text-sm">
            Tell others where, when and how fast you run. They can join with one tap.
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
          Meeting point
          <select value={place} onChange={(e) => setPlace(e.target.value)} className={fieldClass}>
            {RUN_MEETING_POINTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value={OTHER}>Other place…</option>
          </select>
        </label>
        {place === OTHER && (
          <label className="text-sm font-medium">
            Place
            <input
              required
              value={otherLocation}
              onChange={(e) => setOtherLocation(e.target.value)}
              placeholder="e.g. Jardim da Estrela"
              className={fieldClass}
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Distance (km)
            <input
              type="number"
              required
              min={1}
              max={50}
              step={0.5}
              value={Number.isFinite(distanceKm) ? distanceKm : ""}
              onChange={(e) => setDistanceKm(e.target.value === "" ? NaN : Number(e.target.value))}
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-medium">
            Pace (min/km)
            <select
              value={paceSecPerKm}
              onChange={(e) => setPace(Number(e.target.value))}
              className={fieldClass}
            >
              {RUN_PACES.map((p) => (
                <option key={p} value={p}>
                  {formatPace(p)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {validDistance && (
          <p className="text-muted -mt-2 text-xs">
            About {formatDuration(estimateMinutes(distanceKm, paceSecPerKm))} of running.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Level (who can join)
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as RunLevel)}
              className={fieldClass}
            >
              {RUN_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Difficulty (the run)
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as RunDifficulty)}
              className={fieldClass}
            >
              {RUN_DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-muted -mt-2 text-xs">
          {RUN_LEVELS.find((l) => l.value === level)?.description}{" "}
          {RUN_DIFFICULTIES.find((d) => d.value === difficulty)?.description}
        </p>

        <label className="text-sm font-medium">
          Note (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="e.g. Riverside route, coffee afterwards"
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
            Post run
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
