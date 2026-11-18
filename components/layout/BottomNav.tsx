"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isActive } from "@/lib/config/navigation";

/**
 * Floating glass tab bar (modern iOS). Content scrolls underneath; a soft fade
 * keeps text from running straight into the bar. Items come from lib/config/navigation.ts.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden
        className="from-background pointer-events-none fixed inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t to-transparent"
      />
      <nav
        aria-label="Main"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20 mx-auto max-w-md"
      >
        <ul className="glass flex h-16 rounded-full p-1 shadow-[0_10px_30px_rgb(15_27_42/0.14)]">
          {MAIN_NAV.map(({ href, label, icon: Icon, alsoActiveFor }) => {
            const active = isActive(pathname, href, alsoActiveFor);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-visible:outline-brand flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition focus-visible:outline-2 active:scale-95 ${
                    active
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-foreground/75 hover:text-foreground font-medium"
                  }`}
                >
                  <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
