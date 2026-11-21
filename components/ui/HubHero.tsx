import Image from "next/image";

interface HubHeroProps {
  /** Photo for the banner; without one, a coloured banner with the module's icons is shown. */
  image?: { src: string; alt: string };
  /** Icons drawn on the coloured banner when there is no photo. */
  icons?: React.ReactNode;
  /** Tailwind gradient for the coloured banner, e.g. "from-[#0a84ff] to-[#0b2a4a]". */
  gradient?: string;
  headline: string;
  text: string;
}

/** Banner at the top of an overview page (Sport, Study, Campus) with a short headline. */
export function HubHero({
  image,
  icons,
  gradient = "from-[#0a84ff] to-[#0b2a4a]",
  headline,
  text,
}: HubHeroProps) {
  return (
    <section className="mb-6 space-y-4">
      <div
        className={`relative aspect-[2/1] overflow-hidden rounded-3xl sm:aspect-[3/1] ${image ? "" : `bg-gradient-to-br ${gradient}`}`}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            preload
            className="object-cover"
          />
        ) : (
          // Big, soft icons scattered over the colour, like a wallpaper.
          <div
            aria-hidden
            className="absolute inset-0 flex flex-wrap items-center justify-around gap-6 p-6 text-white/25 [&_svg]:size-14 [&_svg]:stroke-[1.5]"
          >
            {icons}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{headline}</h2>
        <p className="text-muted leading-relaxed">{text}</p>
      </div>
    </section>
  );
}
