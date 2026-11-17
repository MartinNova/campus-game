"use client";

import { Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { playtomicUrlFor } from "@/lib/padel/clubs";
import { formatLevel, freeSpots, type PadelMatch } from "@/types/padel";
import type { User } from "@/types/user";
import { PlaytomicLink } from "./PlaytomicLink";

interface MatchCardProps {
  match: PadelMatch;
  currentUserId: string | undefined;
  users: User[];
  busy: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onCancel: () => void;
}

/** One posted court booking with its players and the join / leave / cancel action. */
export function MatchCard({
  match,
  currentUserId,
  users,
  busy,
  onJoin,
  onLeave,
  onCancel,
}: MatchCardProps) {
  const spots = freeSpots(match);
  const isCreator = match.createdBy === currentUserId;
  const isPlayer = !!currentUserId && match.playerIds.includes(currentUserId);
  const players = match.playerIds.map((id) => ({ id, user: users.find((u) => u.id === id) }));

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-lg font-semibold">
            <Clock className="text-muted size-4" aria-hidden />
            {match.time}
            <span className="text-muted text-sm font-normal">· {match.durationMinutes} min</span>
          </p>
          <p className="text-muted mt-0.5 flex items-center gap-1.5 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{match.location}</span>
          </p>
        </div>
        <Badge tone={spots === 0 ? "neutral" : "good"}>
          {spots === 0 ? "Full" : `${spots} player${spots > 1 ? "s" : ""} needed`}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="brand">Level {formatLevel(match.level)}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <Users className="text-muted size-4 shrink-0" aria-hidden />
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {players.map(({ id, user }) => {
            const content = (
              <>
                {user && (
                  <Avatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    username={user.username}
                    url={user.avatarUrl}
                    size={24}
                  />
                )}
                {user?.firstName ?? "Player"}
              </>
            );
            return (
              <li key={id}>
                {user?.username ? (
                  <Link
                    href={`/friends/${user.username}`}
                    className="hover:text-brand flex items-center gap-1.5"
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5">{content}</span>
                )}
              </li>
            );
          })}
          {match.guestCount > 0 && (
            <li className="text-muted">
              +{match.guestCount} friend{match.guestCount > 1 ? "s" : ""}
            </li>
          )}
          <li className="text-muted">
            ({match.maxPlayers - spots}/{match.maxPlayers})
          </li>
        </ul>
      </div>
      {match.description && <p className="mt-2 text-sm">{match.description}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {isCreator ? (
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            Cancel match
          </Button>
        ) : isPlayer ? (
          <Button variant="secondary" disabled={busy} onClick={onLeave}>
            Leave
          </Button>
        ) : (
          <Button disabled={busy || spots === 0 || !currentUserId} onClick={onJoin}>
            Join match
          </Button>
        )}
        <PlaytomicLink
          href={playtomicUrlFor(match.location)}
          className="text-muted hover:text-foreground inline-flex h-10 items-center gap-1 px-2 text-sm"
        >
          Club on Playtomic
        </PlaytomicLink>
      </div>
    </Card>
  );
}
