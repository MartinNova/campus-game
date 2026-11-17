"use client";

import { ExternalLink } from "lucide-react";

interface PlaytomicLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Link to Playtomic. Tries a new tab first so the app (and a half-filled form)
 * stays open; if the browser blocks that, it opens Playtomic in the same tab.
 */
export function PlaytomicLink({ href, className = "", children }: PlaytomicLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle cmd/ctrl-click and middle-click as usual.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // No "noopener" feature here: with it, window.open always returns null and we couldn't
    // tell whether the tab was blocked. We cut the link to our page manually instead.
    const tab = window.open(href, "_blank");
    if (tab) tab.opener = null;
    else window.location.assign(href);
  }

  return (
    <a href={href} rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
    </a>
  );
}
