import Link from "next/link";
import { APP_SHORT_NAME } from "@/lib/config/app";
import { AccountSwitcher } from "./AccountSwitcher";

export function Header() {
  return (
    <header className="border-border bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-brand font-bold tracking-tight">
          {APP_SHORT_NAME}
        </Link>
        <AccountSwitcher />
      </div>
    </header>
  );
}
