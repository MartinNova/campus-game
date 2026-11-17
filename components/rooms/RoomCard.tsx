import { BedDouble, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatAvailability, formatRent } from "@/lib/rooms/rooms";
import { ROOM_TYPES, type RoomListing } from "@/types/rooms";
import type { User } from "@/types/user";

interface RoomCardProps {
  listing: RoomListing;
  poster: User | undefined;
  today: string;
}

/** One listing in the list; the whole card opens the details. */
export function RoomCard({ listing, poster, today }: RoomCardProps) {
  return (
    <Link
      href={`/campus/rooms/listing?id=${listing.id}`}
      className="border-border bg-surface hover:border-brand block overflow-hidden rounded-2xl border shadow-sm transition-colors"
    >
      {listing.photos[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- user uploads from Supabase Storage
        <img
          src={listing.photos[0]}
          alt=""
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      ) : (
        listing.kind === "offer" && (
          <div className="bg-brand/10 text-brand flex aspect-[16/6] items-center justify-center">
            <BedDouble className="size-8" aria-hidden />
          </div>
        )
      )}
      <div className="grid gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold">{listing.title}</p>
          {listing.photos.length > 1 && <Badge>{listing.photos.length} photos</Badge>}
        </div>
        <p className="text-brand text-lg font-bold">{formatRent(listing)}</p>
        <div className="text-muted grid gap-1 text-sm">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {listing.area} · {ROOM_TYPES[listing.roomType]}
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {formatAvailability(listing, today)}
          </p>
        </div>
        {poster && (
          <p className="text-muted flex items-center gap-2 text-sm">
            <Avatar
              firstName={poster.firstName}
              lastName={poster.lastName}
              username={poster.username}
              url={poster.avatarUrl}
              size={24}
            />
            {poster.firstName || `@${poster.username}`}
          </p>
        )}
      </div>
    </Link>
  );
}
