"use client";

import { Home, TrainFront, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { setGuest } from "@/lib/welcome/guest";

const FEATURES = [
  { icon: Users, title: "Meet Nova students", text: "Find classmates by programme and sport." },
  { icon: Trophy, title: "Play together", text: "Join padel matches and runs, or post your own." },
  { icon: Home, title: "Rooms & flats", text: "Find a room near campus or pass yours on." },
  {
    icon: TrainFront,
    title: "Your day, sorted",
    text: "Next trains, deadlines and your timetable.",
  },
];

/** First screen for signed-out visitors: what the app does, then sign in or look around. */
export function WelcomeScreen() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      {/* White background blends away in light mode; inverted + screen in dark mode. */}
      <Image
        priority
        src="/nova-logo.png"
        alt="Nova School of Business & Economics"
        width={840}
        height={160}
        className="h-9 w-[189px] max-w-none mix-blend-multiply dark:mix-blend-screen dark:invert"
      />

      <h1 className="mt-10 text-4xl leading-tight font-bold tracking-tight">
        Your campus life in one app
      </h1>
      <p className="text-muted mt-3 text-lg">
        Sport, friends, rooms and everything you need at Nova SBE.
      </p>

      <ul className="mt-8 grid gap-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="text-muted block text-sm">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto grid gap-3 pt-10">
        <Link
          href="/login?tab=signup"
          className="bg-brand text-brand-foreground flex h-12 items-center justify-center rounded-xl text-base font-semibold hover:opacity-90"
        >
          Create account
        </Link>
        <Link
          href="/login?tab=signin&next=/"
          className="border-border bg-surface hover:border-brand flex h-12 items-center justify-center rounded-xl border text-base font-semibold"
        >
          Sign in
        </Link>
        <button
          type="button"
          onClick={() => setGuest(true)}
          className="text-muted hover:text-foreground h-11 text-sm underline-offset-4 hover:underline"
        >
          Look around first
        </button>
      </div>
    </div>
  );
}
