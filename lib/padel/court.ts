import type { PadelMatch } from "@/types/padel";

/** One of the four places on the court. */
export type CourtSlot =
  { kind: "player"; userId: string; isOrganiser: boolean } | { kind: "guest" } | { kind: "free" };

/**
 * The four places on the court, in the order they are drawn:
 * organiser first, then the other players, then the organiser's friends, then free places.
 * Two teams of two: slots 0–1 on one side of the net, 2–3 on the other.
 */
export function courtSlots(
  match: Pick<PadelMatch, "playerIds" | "guestCount" | "maxPlayers" | "createdBy">,
): CourtSlot[] {
  const players: CourtSlot[] = match.playerIds.map((userId) => ({
    kind: "player",
    userId,
    isOrganiser: userId === match.createdBy,
  }));
  const guests: CourtSlot[] = Array.from({ length: match.guestCount }, () => ({ kind: "guest" }));
  const filled = [...players, ...guests].slice(0, match.maxPlayers);
  const free: CourtSlot[] = Array.from({ length: match.maxPlayers - filled.length }, () => ({
    kind: "free",
  }));
  return [...filled, ...free];
}
