import type { Metadata } from "next";
import Image from "next/image";
import { SurfView } from "@/components/sport/surf/SurfView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Surf" };

export default function SurfPage() {
  return (
    <>
      <PageHeader
        title="Surf"
        subtitle="Forecast and surf schools near Lisbon."
        backHref="/sport"
      />
      <div className="relative mb-6 aspect-[2/1] overflow-hidden rounded-2xl sm:aspect-[3/1]">
        <Image
          src="/images/nova-surf-banner.png"
          alt="Surfers carrying their boards along the beach."
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          preload
          className="object-cover object-left"
        />
      </div>
      <SurfView />
    </>
  );
}
