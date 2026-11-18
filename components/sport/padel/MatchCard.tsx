"use client";

import { Clock, MapPin, MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { playtomicUrlFor } from "@/lib/padel/clubs";
import { myRequest, pendingRequests } from "@/lib/padel/matches";
import { MAX_REQUEST_NOTE, formatLevel, freeSpots, type PadelMatch } from "@/types/padel";
import type { User } from "@/types/user";
import { PlaytomicLink } from "./PlaytomicLink";

interface MatchCardProps {
  match: PadelMatch;
  currentUserId: string | undefined;
  users: User[];
  busy: boolean;
  onRequest: (note: string) => Promise<void>;
  onWithdraw: () => void;
  onRespond: (requestId: string, accept: boolean) => void;
  onLeave: () => void;
  onCancel: () => void;
}

/**
 * One posted court booking with its players. Others ask to join; the organiser
 * accepts or declines requests right on the card.
 */
export function MatchCard({
  match,
  currentUserId,
  users,
  busy,
  onRequest,
  onWithdraw,
  onRespond,
  onLeave,
  onCancel,
}: MatchCardProps) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const spots = freeSpots(match);
  const isCreator = match.createdBy === currentUserId;
  const isPlayer = !!currentUserId && match.playerIds.includes(currentUserId);
  const request = currentUserId ? myRequest(match, currentUserId) : undefined;
  const pending = isCreator ? pendingRequests(match) : [];

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    await onRequest(note);
    setAsking(false);
    setNote("");
  }
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
                    href={`/friends/profile?u=${user.username}`}
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

      {pending.length > 0 && (
        <div className="border-border mt-4 grid gap-2 border-t pt-3">
          <p className="text-sm font-semibold">
            {pending.length} request{pending.length > 1 ? "s" : ""} to join
          </p>
          <ul className="grid gap-3">
            {pending.map((r) => {
              const asker = users.find((u) => u.id === r.userId);
              return (
                <li key={r.id} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    {asker && (
                      <Avatar
                        firstName={asker.firstName}
                        lastName={asker.lastName}
                        username={asker.username}
                        url={asker.avatarUrl}
                        size={32}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {asker
                          ? [asker.firstName, asker.lastName].filter(Boolean).join(" ")
                          : "Player"}
                      </span>
                      {r.note && (
                        <span className="text-muted block text-sm break-words">“{r.note}”</span>
                      )}
                    </span>
                    {asker?.username && (
                      <Link
                        href={`/friends/chat?u=${asker.username}`}
                        className="text-muted hover:text-brand rounded-lg p-2"
                        aria-label={`Message ${asker.firstName}`}
                      >
                        <MessageCircle className="size-5" aria-hidden />
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button disabled={busy || spots === 0} onClick={() => onRespond(r.id, true)}>
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onRespond(r.id, false)}
                    >
                      Decline
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {spots === 0 && <p className="text-muted text-xs">The court is full now.</p>}
        </div>
      )}

      {asking && (
        <form onSubmit={sendRequest} className="mt-4 grid gap-2">
          <label className="text-sm font-medium" htmlFor={`note-${match.id}`}>
            Note to the organiser (optional)
          </label>
          <textarea
            id={`note-${match.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={MAX_REQUEST_NOTE}
            rows={2}
            placeholder="e.g. I play about level 3, happy to bring balls"
            className="border-border bg-surface focus-visible:outline-brand w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-2"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              Send request
            </Button>
            <Button variant="ghost" onClick={() => setAsking(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isCreator ? (
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            Cancel match
          </Button>
        ) : isPlayer ? (
          <Button variant="secondary" disabled={busy} onClick={onLeave}>
            Leave
          </Button>
        ) : request?.status === "pending" ? (
          <>
            <Badge tone="medium">Request sent</Badge>
            <Button variant="ghost" disabled={busy} onClick={onWithdraw}>
              Take back
            </Button>
          </>
        ) : request?.status === "declined" ? (
          <Badge>Not this time</Badge>
        ) : (
          !asking && (
            <Button
              disabled={busy || spots === 0 || !currentUserId}
              onClick={() => setAsking(true)}
            >
              Ask to join
            </Button>
          )
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
