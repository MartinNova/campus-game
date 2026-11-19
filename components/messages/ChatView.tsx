"use client";

import { ImagePlus, SendHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { formatMessageTime } from "@/lib/messages/messages";
import { resizePhoto } from "@/lib/rooms/photos";
import { messageService } from "@/lib/services/message.service";
import { AUTH_MODE } from "@/lib/supabase/config";
import { MAX_MESSAGE_LENGTH, type Message } from "@/types/messages";

/** Demo mode keeps pictures in the browser's small storage, so they are kept smaller there. */
const MAX_IMAGE_SIDE = AUTH_MODE === "accounts" ? 1600 : 1024;

/** One chat with another student (?u=username), live. */
export function ChatView() {
  const username = useSearchParams().get("u") ?? "";
  const { user, users, ready } = useCurrentUser();
  const other = users.find((u) => u.username === username.toLowerCase());
  const userId = user?.id;
  const otherId = other?.id;

  const [thread, setThread] = useState<{ key: string; messages: Message[] } | null>(null);
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const key = `${userId}:${otherId}`;

  const reload = useCallback(() => {
    if (!userId || !otherId) return;
    void messageService
      .listThread(userId, otherId)
      .then((messages) => {
        setThread({ key: `${userId}:${otherId}`, messages });
        // Opening the chat (or a new message arriving while it's open) counts as reading it.
        if (messages.some((m) => m.recipientId === userId && !m.readAt))
          void messageService.markRead(userId, otherId);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load the chat."),
      );
  }, [userId, otherId]);

  useEffect(reload, [reload]);
  useEffect(() => (userId ? messageService.onChange(userId, reload) : undefined), [userId, reload]);

  const messages = thread?.key === key ? thread.messages : null;
  const count = messages?.length ?? 0;
  // Newest message at the bottom, just above the message field (like any messenger).
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [count]);

  // Free the preview's memory when it's replaced or removed.
  useEffect(() => (image ? () => URL.revokeObjectURL(image.url) : undefined), [image]);

  // Escape closes the full-screen picture.
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same picture again still fires
    if (!file) return;
    setError(null);
    try {
      const blob = await resizePhoto(file, MAX_IMAGE_SIDE);
      setImage({ blob, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this picture.");
    }
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!userId || !otherId || sending || (!draft.trim() && !image)) return;
    setSending(true);
    setError(null);
    try {
      await messageService.send(userId, otherId, draft, image?.blob);
      setDraft("");
      setImage(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <div className="bg-border h-64 animate-pulse rounded-2xl" />;
  if (!user) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Sign in to send messages</p>
        <Link href="/login" className="text-brand mt-2 inline-block text-sm underline">
          Sign in or create account
        </Link>
      </Card>
    );
  }
  if (!other) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Student not found</p>
        <p className="text-muted mt-1 text-sm">The account may have been deleted.</p>
      </Card>
    );
  }
  if (other.id === user.id) {
    return (
      <Card className="text-center">
        <p className="font-semibold">That&apos;s you</p>
        <p className="text-muted mt-1 text-sm">Pick someone else to message.</p>
      </Card>
    );
  }

  const name = [other.firstName, other.lastName].filter(Boolean).join(" ") || `@${other.username}`;
  const now = new Date();
  const canSend = !sending && (Boolean(draft.trim()) || Boolean(image));

  return (
    <div className="grid grid-cols-1 gap-3">
      <Link
        href={`/friends/profile?u=${other.username}`}
        className="bg-surface focus-visible:outline-brand active:bg-brand/5 flex items-center gap-3 rounded-3xl p-3 transition focus-visible:outline-2 active:scale-[0.98]"
      >
        <Avatar
          firstName={other.firstName}
          lastName={other.lastName}
          username={other.username}
          url={other.avatarUrl}
          size={40}
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{name}</span>
          <span className="text-muted block text-sm">View profile</span>
        </span>
      </Link>

      {!messages ? (
        <div className="bg-border h-48 animate-pulse rounded-2xl" aria-busy="true" />
      ) : messages.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">
          Say hi to {other.firstName || name}. Messages are only visible to the two of you.
        </p>
      ) : (
        <ol className="grid gap-1.5 py-2" aria-label={`Chat with ${name}`}>
          {messages.map((m, i) => {
            const mine = m.senderId === user.id;
            const showTime =
              i === 0 ||
              new Date(m.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() >
                15 * 60_000;
            return (
              <li key={m.id} className="grid">
                {showTime && (
                  <span className="text-muted my-2 text-center text-xs">
                    {formatMessageTime(m.createdAt, now)}
                  </span>
                )}
                <span
                  className={`flex max-w-[80%] flex-col overflow-hidden rounded-2xl text-[15px] break-words whitespace-pre-line ${
                    mine
                      ? "bg-brand text-brand-foreground justify-self-end rounded-br-md"
                      : "bg-surface justify-self-start rounded-bl-md"
                  } ${m.imageUrl ? "p-1" : "px-3.5 py-2"}`}
                >
                  {m.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setViewing(m.imageUrl)}
                      className="focus-visible:outline-brand block rounded-[14px] focus-visible:outline-2"
                      aria-label="Open picture"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed or data URL, already resized */}
                      <img
                        src={m.imageUrl}
                        alt=""
                        loading="lazy"
                        className="max-h-80 w-full min-w-40 rounded-[14px] object-cover"
                      />
                    </button>
                  )}
                  {m.body && (
                    <span className={m.imageUrl ? "px-2.5 pt-1.5 pb-1" : ""}>{m.body}</span>
                  )}
                </span>
              </li>
            );
          })}
          {messages.at(-1)?.senderId === user.id && messages.at(-1)?.readAt && (
            <li className="text-muted justify-self-end text-xs">Seen</li>
          )}
        </ol>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Message field: always at the bottom of the screen (the tab bar is hidden in chats). */}
      <form
        onSubmit={send}
        className="glass fixed inset-x-0 bottom-0 z-20 border-x-0 border-b-0 pb-[calc(env(safe-area-inset-bottom)+8px)]"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 pt-2">
          {image && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
              <img
                src={image.url}
                alt="Picture to send"
                className="h-20 w-auto max-w-40 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="Remove picture"
                className="bg-foreground/80 text-background absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={pickImage}
              className="hidden"
              aria-hidden
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="Add picture"
              className="text-brand flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 active:opacity-60"
            >
              <ImagePlus className="size-6" aria-hidden />
            </button>
            <label className="sr-only" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter makes a new line (like WhatsApp Web).
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={`Message ${other.firstName || name}`}
              className="border-border bg-surface focus-visible:outline-brand max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border px-4 py-2.5 text-base focus-visible:outline-2"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send"
              className="bg-brand text-brand-foreground flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40 disabled:active:scale-100"
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </form>

      {viewing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Picture"
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewing(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed or data URL, already resized */}
          <img src={viewing} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            type="button"
            onClick={() => setViewing(null)}
            aria-label="Close picture"
            autoFocus
            className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
