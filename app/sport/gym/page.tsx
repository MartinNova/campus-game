import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ArrowUpRight, Dumbbell, MapPin } from "lucide-react";
import { GymView } from "@/components/sport/gym/GymView";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { VIVA_GYM } from "@/data/viva-gym";

export const metadata: Metadata = { title: "Gym" };

/** Optional photo of the gym. Put the file at public/images/viva-gym.jpg to show it. */
const PHOTO = "/images/viva-gym.jpg";
const HAS_PHOTO = existsSync(join(process.cwd(), "public", PHOTO));

export default function GymPage() {
  return (
    <>
      <PageHeader
        title="Gym"
        subtitle="Viva Gym on campus: opening hours and how busy it is."
        backHref="/sport"
      />

      <div className="bg-brand text-brand-foreground relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl">
        {HAS_PHOTO ? (
          <Image
            src={PHOTO}
            alt="Inside the Viva Gym on the Nova SBE campus."
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            preload
            className="object-cover object-center"
          />
        ) : (
          <div className="flex size-full items-center justify-center" aria-hidden>
            <Dumbbell className="size-16 opacity-70" />
          </div>
        )}
      </div>

      <Card className="mb-4">
        <h2 className="text-lg font-semibold">{VIVA_GYM.name}</h2>
        <p className="text-muted mt-1 flex items-start gap-1.5 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {VIVA_GYM.address}
        </p>
        <a
          href={VIVA_GYM.website}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand text-brand-foreground focus-visible:outline-brand mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
        >
          Viva Gym website
          <ArrowUpRight className="size-4" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Card>

      <GymView gym={VIVA_GYM} />
    </>
  );
}
