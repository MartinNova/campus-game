import {
  ArrowUpRight,
  BookOpenText,
  DoorOpen,
  House,
  Map,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import type { CampusLink } from "@/types/campus";

const ICONS = {
  "book-search": BookOpenText,
  "study-room": DoorOpen,
  map: Map,
  canteen: UtensilsCrossed,
  train: TrainFront,
  home: House,
} satisfies Record<CampusLink["icon"], unknown>;

const CARD_CLASS =
  "border-border bg-surface hover:border-brand focus-visible:outline-brand flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-colors focus-visible:outline-2";

/** Card for a campus link. External links open in a new tab, internal ones navigate in-app. */
export function CampusLinkCard({ link }: { link: CampusLink }) {
  const Icon = ICONS[link.icon];
  const isExternal = !link.href.startsWith("/");

  const content = (
    <>
      <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{link.title}</span>
        <span className="text-muted mt-0.5 block text-sm">{link.description}</span>
      </span>
      {isExternal && <ArrowUpRight className="text-muted size-4 shrink-0" aria-hidden />}
    </>
  );

  return isExternal ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={CARD_CLASS}>
      {content}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link href={link.href} className={CARD_CLASS}>
      {content}
    </Link>
  );
}
