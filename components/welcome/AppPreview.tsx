"use client";

import { Crown, Home, Plus, TrainFront } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Swipeable preview of what the app does, drawn as mini screens (not screenshots),
 * so it always matches the current design and works in light and dark mode.
 */
const SLIDES = [
  {
    title: "Play together",
    text: "Booked a padel court? Post it, others ask to join, you accept.",
    preview: <MiniCourt />,
  },
  {
    title: "Meet Nova students",
    text: "Find classmates by programme and sport, and chat right away.",
    preview: <MiniChat />,
  },
  {
    title: "Your day, sorted",
    text: "Your train after class, deadlines and your timetable.",
    preview: <MiniTrain />,
  },
  {
    title: "Rooms & flats",
    text: "Find a room near campus or pass yours on when you leave.",
    preview: <MiniRoom />,
  },
];

export function AppPreview() {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <section aria-label="What you can do" className="-mx-6">
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, i) => (
          <article
            key={slide.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}: ${slide.title}`}
            className="w-full shrink-0 snap-center px-6"
          >
            <div className="bg-surface flex h-44 items-center justify-center overflow-hidden rounded-3xl p-4">
              {slide.preview}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{slide.title}</h2>
            <p className="text-muted mt-1 text-[15px] leading-snug">{slide.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show ${slide.title}`}
            aria-current={active === i}
            onClick={() =>
              scroller.current?.scrollTo({
                left: i * scroller.current.clientWidth,
                behavior: "smooth",
              })
            }
            className={`h-2 rounded-full transition-all ${active === i ? "bg-brand w-6" : "bg-muted/40 w-2"}`}
          />
        ))}
      </div>
    </section>
  );
}

function Face({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white ${color}`}
    >
      {initials}
    </span>
  );
}

function MiniCourt() {
  return (
    <div className="relative grid w-56 gap-5 rounded-2xl bg-[#1f6fb2] p-3">
      <div className="absolute inset-2 rounded-md border-2 border-white/70" />
      <div className="absolute inset-x-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/90" />
      {[
        [
          <span key="a" className="relative">
            <Face initials="SA" color="bg-[#d6336c]" />
            <Crown className="absolute -top-2 -right-2 size-4 rounded-full bg-amber-400 p-0.5 text-amber-950" />
          </span>,
          <Face key="b" initials="TF" color="bg-[#2e9d4f]" />,
        ],
        [
          <span
            key="c"
            className="slot-in flex size-9 items-center justify-center rounded-full border-2 border-dashed border-white/80 text-white"
          >
            <Plus className="size-4" />
          </span>,
          <Face key="d" initials="MS" color="bg-[#e8772e]" />,
        ],
      ].map((side, i) => (
        <div key={i} className="relative flex justify-around">
          {side}
        </div>
      ))}
    </div>
  );
}

function MiniChat() {
  return (
    <div className="grid w-60 gap-1.5 text-[13px]">
      <span className="bg-background justify-self-start rounded-2xl rounded-bl-md px-3 py-1.5">
        Padel tonight at 19:00? 🎾
      </span>
      <span className="bg-brand text-brand-foreground justify-self-end rounded-2xl rounded-br-md px-3 py-1.5">
        I&apos;m in! Bringing balls
      </span>
      <span className="bg-background flex items-center gap-1 justify-self-start rounded-2xl rounded-bl-md px-3 py-2.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="typing-dot bg-muted size-1.5 rounded-full"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

function MiniTrain() {
  return (
    <div className="grid w-60 gap-2">
      <p className="text-muted text-xs">Your last class ends at 17:30</p>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#0a84ff] text-white">
          <TrainFront className="size-5" />
        </span>
        <span>
          <span className="block text-2xl font-bold tabular-nums">17:53</span>
          <span className="text-muted block text-xs">Oeiras → Cais do Sodré</span>
        </span>
      </div>
      <p className="text-xs font-medium text-green-600 dark:text-green-400">
        Leave campus by 17:33
      </p>
    </div>
  );
}

function MiniRoom() {
  return (
    <div className="flex w-60 items-center gap-3">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#7b3fa0] text-white">
        <Home className="size-7" />
      </span>
      <span>
        <span className="block text-sm font-semibold">Bright room near campus</span>
        <span className="text-brand block text-base font-bold">620 €/month</span>
        <span className="text-muted block text-xs">Carcavelos · from 1 Feb</span>
      </span>
    </div>
  );
}
