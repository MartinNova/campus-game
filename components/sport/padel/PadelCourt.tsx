"use client";

import { Crown, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { courtSlots, type CourtSlot } from "@/lib/padel/court";
import type { PadelMatch } from "@/types/padel";
import type { User } from "@/types/user";

interface PadelCourtProps {
  match: PadelMatch;
  users: User[];
  /** Called when someone taps a free place (only when they may ask to join). */
  onFreeSlot?: () => void;
}

/**
 * The court from above: blue court, white lines, net in the middle and four places.
 * Players sit on their place with their picture; a new player pops in (see .slot-in).
 */
export function PadelCourt({ match, users, onFreeSlot }: PadelCourtProps) {
  const slots = courtSlots(match);
  const sides = [slots.slice(0, 2), slots.slice(2, 4)];

  return (
    <div
      className="relative mt-3 overflow-hidden rounded-2xl bg-[#1f6fb2] p-3 dark:bg-[#185a91]"
      role="group"
      aria-label={`Court: ${match.maxPlayers - slots.filter((s) => s.kind === "free").length} of ${match.maxPlayers} places taken`}
    >
      {/* Outer line and the centre line from each service line to the back (kept short of the names). */}
      <div className="pointer-events-none absolute inset-3 rounded-md border-2 border-white/70" />
      <div className="pointer-events-none absolute top-3 bottom-3 left-1/2 border-l-2 border-white/35" />
      {/* The net. */}
      <div className="pointer-events-none absolute inset-x-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.25)]" />

      <div className="relative grid gap-10">
        {sides.map((side, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            {side.map((slot, j) => (
              <Slot
                key={slot.kind === "player" ? slot.userId : `${slot.kind}-${i}-${j}`}
                slot={slot}
                users={users}
                onFreeSlot={onFreeSlot}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({
  slot,
  users,
  onFreeSlot,
}: {
  slot: CourtSlot;
  users: User[];
  onFreeSlot?: () => void;
}) {
  const base = "flex h-[76px] flex-col items-center justify-center gap-1 rounded-xl";

  if (slot.kind === "free") {
    const content = (
      <>
        <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-white/80 text-white">
          <Plus className="size-5" aria-hidden />
        </span>
        <span className="text-xs font-medium text-white/90">Free</span>
      </>
    );
    return onFreeSlot ? (
      <button
        type="button"
        onClick={onFreeSlot}
        className={`${base} transition hover:bg-white/10 active:scale-95`}
        aria-label="Free place: ask to join"
      >
        {content}
      </button>
    ) : (
      <div className={base}>{content}</div>
    );
  }

  if (slot.kind === "guest") {
    return (
      <div className={base}>
        <span className="flex size-10 items-center justify-center rounded-full bg-white/25 text-white">
          <UserRound className="size-5" aria-hidden />
        </span>
        <span className="text-xs font-medium text-white/90">Friend</span>
      </div>
    );
  }

  const user = users.find((u) => u.id === slot.userId);
  const name = user?.firstName || (user?.username ? `@${user.username}` : "Player");
  const content = (
    <>
      <span className="relative">
        <span className="block rounded-full ring-2 ring-white">
          <Avatar
            firstName={user?.firstName ?? "?"}
            lastName={user?.lastName ?? ""}
            username={user?.username}
            url={user?.avatarUrl}
            size={40}
          />
        </span>
        {slot.isOrganiser && (
          <span
            className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-amber-400 text-amber-950"
            title="Organiser"
          >
            <Crown className="size-3" aria-label="Organiser" />
          </span>
        )}
      </span>
      <span className="max-w-full truncate px-1 text-xs font-semibold text-white">{name}</span>
    </>
  );

  return user?.username ? (
    <Link
      href={`/friends/profile?u=${user.username}`}
      className={`${base} slot-in transition hover:bg-white/10`}
    >
      {content}
    </Link>
  ) : (
    <div className={`${base} slot-in`}>{content}</div>
  );
}
