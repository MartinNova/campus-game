import Image from "next/image";
import Link from "next/link";
import { APP_SHORT_NAME } from "@/lib/config/app";
import { AccountSwitcher } from "./AccountSwitcher";

export function Header() {
  return (
    <header className="border-border bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label={APP_SHORT_NAME} className="flex items-center">
          {/* White background blends away in light mode; inverted + screen in dark mode. */}
          <Image
            priority
            src="/nova-logo.png"
            alt="Nova School of Business & Economics"
            width={840}
            height={160}
            className="h-8 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
          />
        </Link>
        <AccountSwitcher />
      </div>
    </header>
  );
}
