"use client";

import { Clock, MapPin, Route, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRunClub } from "@/data/running-clubs";
import { estimateMinutes, formatDuration, formatPace } from "@/lib/running/runs";
import { RUN_DIFFICULTIES, RUN_LEVELS, type Run } from "@/types/running";
import type { User } from "@/types/user";

interface RunCardProps {
  run: Run;
  currentUserId: string | undefined;
  users: User[];
  busy: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onCancel: () => void;
}

/** One run (posted by a student or a weekly club run) with join / leave / cancel. */
export function RunCard({
  run,
  currentUserId,
  users,
  busy,
  onJoin,
  onLeave,
  onCancel,
}: RunCardProps) {
  const club = getRunClub(run.clubId);
  const isCreator = !!currentUserId && run.createdBy === currentUserId;
  const isRunner = !!currentUserId && run.runnerIds.includes(currentUserId);
  const names = run.runnerIds.map((id) => users.find((u) => u.id === id)?.firstName ?? "Runner");
  const level = RUN_LEVELS.find((l) => l.value === run.level);
  const difficulty = RUN_DIFFICULTIES.find((d) => d.value === run.difficulty);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-lg font-semibold">
            <Clock className="text-muted size-4" aria-hidden />
            {run.time}
            {run.distanceKm !== null && run.paceSecPerKm !== null && (
              <span className="text-muted text-sm font-normal">
                · about {formatDuration(estimateMinutes(run.distanceKm, run.paceSecPerKm))}
              </span>
            )}
          </p>
          <p className="text-muted mt-0.5 flex items-center gap-1.5 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{run.location}</span>
          </p>
        </div>
        {club && <Badge tone="brand">{club.name}</Badge>}
      </div>

      {(run.distanceKm !== null || level || difficulty) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {run.distanceKm !== null && run.paceSecPerKm !== null && (
            <Badge tone="neutral">
              <Route className="mr-1 inline size-3" aria-hidden />
              {run.distanceKm} km · {formatPace(run.paceSecPerKm)} /km
            </Badge>
          )}
          {level && <Badge tone="brand">{level.label}</Badge>}
          {difficulty && <Badge tone="neutral">{difficulty.label}</Badge>}
        </div>
      )}

      <p className="text-muted mt-3 flex items-center gap-1.5 text-sm">
        <Users className="size-4 shrink-0" aria-hidden />
        {names.length === 0 ? "Be the first to join" : `${names.join(", ")} (${names.length})`}
      </p>
      {run.description && <p className="mt-2 text-sm">{run.description}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {isCreator ? (
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            Cancel run
          </Button>
        ) : isRunner ? (
          <Button variant="secondary" disabled={busy} onClick={onLeave}>
            Leave
          </Button>
        ) : (
          <Button disabled={busy || !currentUserId} onClick={onJoin}>
            Join run
          </Button>
        )}
      </div>
    </Card>
  );
}
