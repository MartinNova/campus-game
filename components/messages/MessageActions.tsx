"use client";

import { ChevronLeft, Copy, Forward, Plus, Reply, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EMOJI_GROUPS, QUICK_REACTIONS } from "@/lib/messages/reactions";

interface MessageActionsProps {
  /** The pressed message, shown between the emojis and the menu. */
  preview: React.ReactNode;
  /** Your message: the menu sits on the right and offers Delete. */
  mine: boolean;
  /** The emoji you already reacted with (highlighted; choosing it again removes it). */
  current: string | null;
  canCopy: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * What a long press on a message opens, like WhatsApp: the message lifted above a blurred chat,
 * a row of emojis ("+" for all of them) and Reply, Forward, Copy and Delete.
 */
export function MessageActions({
  preview,
  mine,
  current,
  canCopy,
  onReact,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onClose,
}: MessageActionsProps) {
  const [view, setView] = useState<"menu" | "emojis" | "confirm-delete">("menu");
  const emojiBar = useRef<HTMLDivElement>(null);
  // Lifting the finger after the long press must not close the menu straight away.
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    emojiBar.current?.querySelector("button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const emojiButton = (emoji: string) => (
    <button
      key={emoji}
      type="button"
      onClick={() => onReact(emoji)}
      aria-label={`React with ${emoji}`}
      aria-pressed={current === emoji}
      className={`flex size-10 items-center justify-center rounded-full text-2xl transition active:scale-125 ${
        current === emoji ? "bg-brand/15" : "hover:bg-brand/5"
      }`}
    >
      {emoji}
    </button>
  );

  const actions = [
    { label: "Reply", icon: Reply, run: onReply, show: true },
    { label: "Forward", icon: Forward, run: onForward, show: true },
    { label: "Copy", icon: Copy, run: onCopy, show: canCopy },
    {
      label: "Delete",
      icon: Trash2,
      run: () => setView("confirm-delete"),
      show: mine,
      danger: true,
    },
  ].filter((a) => a.show);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Message options"
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => Date.now() - openedAt > 400 && onClose()}
        className="fade-in absolute inset-0 bg-black/25 backdrop-blur-md dark:bg-black/50"
      />
      <div
        className={`menu-in pointer-events-none relative mx-auto flex h-full max-w-2xl flex-col justify-center gap-2.5 px-4 ${
          mine ? "items-end" : "items-start"
        }`}
      >
        {/* Emojis */}
        <div
          ref={emojiBar}
          className="bg-surface pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full p-1 shadow-[0_8px_30px_rgb(15_27_42/0.18)]"
        >
          {QUICK_REACTIONS.map((emoji) => emojiButton(emoji))}
          <button
            type="button"
            onClick={() => setView(view === "emojis" ? "menu" : "emojis")}
            aria-label="More emojis"
            aria-expanded={view === "emojis"}
            className="bg-background text-muted flex size-10 items-center justify-center rounded-full transition active:scale-90"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </div>

        {/* The message itself */}
        <div
          className={`pointer-events-auto flex max-h-[40vh] w-full overflow-hidden ${mine ? "justify-end" : "justify-start"}`}
        >
          {preview}
        </div>

        {/* Menu, all emojis, or "delete?" */}
        <div className="bg-surface pointer-events-auto w-64 overflow-hidden rounded-2xl shadow-[0_12px_40px_rgb(15_27_42/0.22)]">
          {view === "menu" &&
            actions.map(({ label, icon: Icon, run, danger }) => (
              <button
                key={label}
                type="button"
                onClick={run}
                className={`group active:bg-brand/5 flex w-full items-center justify-between border-b border-[var(--border)] px-4 text-left text-[17px] transition-colors last:border-b-0 ${
                  danger ? "text-[#d70015] dark:text-[#ff6961]" : ""
                }`}
              >
                <span className="py-3">{label}</span>
                <Icon className="size-5" aria-hidden />
              </button>
            ))}

          {view === "confirm-delete" && (
            <div className="p-4">
              <p className="font-semibold">Delete message?</p>
              <p className="text-muted mt-1 text-sm">
                It will be deleted for everyone in this chat.
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-11 rounded-xl bg-[#d70015] font-semibold text-white transition active:scale-[0.98]"
                >
                  Delete for everyone
                </button>
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="bg-background h-11 rounded-xl font-medium transition active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {view === "emojis" && (
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              <button
                type="button"
                onClick={() => setView("menu")}
                className="text-brand bg-surface sticky top-0 z-[1] flex w-full items-center gap-1 px-3 py-2.5 text-[15px] font-medium"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Back
              </button>
              {EMOJI_GROUPS.map((group) => (
                <section key={group.label} aria-label={group.label} className="px-2 pb-2">
                  <h3 className="text-muted px-1 pb-1 text-xs font-semibold tracking-wide uppercase">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-6">
                    {group.emojis.map((emoji) => emojiButton(emoji))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
