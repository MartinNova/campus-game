import type { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { LinkCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SPORT_MODULES } from "@/lib/config/navigation";

export const metadata: Metadata = { title: "Sport" };

export default function SportPage() {
  return (
    <>
      <PageHeader title="Sport" subtitle="Play, surf and train with other Nova students." />
      <section aria-labelledby="sport-intro" className="mb-6 space-y-4">
        <div className="relative aspect-[2/1] overflow-hidden rounded-2xl sm:aspect-[3/1]">
          <Image
            src="/images/nova-sport-banner.png"
            alt="An athlete training intensely in a gym."
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            preload
            className="object-cover object-left"
          />
        </div>
        <div className="space-y-2">
          <h2 id="sport-intro" className="text-xl font-semibold tracking-tight">
            Move your body, clear your mind.
          </h2>
          <p className="text-muted leading-relaxed">
            Take a break from studying, recharge your energy, and make the most of an active campus
            life.
          </p>
        </div>
      </section>
      <div className="grid gap-3">
        {SPORT_MODULES.map(({ href, label, description, icon: Icon, status }) => (
          <LinkCard
            key={href}
            href={href}
            title={label}
            description={description}
            icon={<Icon className="size-5" aria-hidden />}
            badge={status === "soon" ? <Badge>Soon</Badge> : null}
          />
        ))}
      </div>
    </>
  );
}
