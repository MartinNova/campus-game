"use client";

import { FileText, ImagePlus, Paperclip, SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  FILE_ACCEPT,
  formatFileSize,
  MAX_DEMO_FILE_BYTES,
  MAX_FILE_BYTES,
  validateFile,
} from "@/lib/messages/attachments";
import { resizePhoto } from "@/lib/rooms/photos";
import { AUTH_MODE } from "@/lib/supabase/config";
import { MAX_MESSAGE_LENGTH, type Attachment } from "@/types/messages";

/** Demo mode keeps attachments in the browser's small storage, so they are kept smaller there. */
const MAX_IMAGE_SIDE = AUTH_MODE === "accounts" ? 1600 : 1024;
const MAX_BYTES = AUTH_MODE === "accounts" ? MAX_FILE_BYTES : MAX_DEMO_FILE_BYTES;

/** What's waiting to be sent: a resized picture (with preview link) or a file. */
type Pending = { kind: "image"; blob: Blob; url: string } | { kind: "file"; file: File };

interface ComposerProps {
  placeholder: string;
  /** Throws to show an error; the draft is kept then. */
  onSend: (body: string, attachment?: Attachment) => Promise<void>;
}

/**
 * Message field with file and picture buttons, fixed to the bottom of the screen
 * (pages using it hide the tab bar, like WhatsApp and iMessage do in a chat).
 */
export function Composer({ placeholder, onSend }: ComposerProps) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Free the preview's memory when it's replaced or removed.
  useEffect(
    () => (pending?.kind === "image" ? () => URL.revokeObjectURL(pending.url) : undefined),
    [pending],
  );

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same picture again still fires
    if (!file) return;
    setError(null);
    try {
      const blob = await resizePhoto(file, MAX_IMAGE_SIDE);
      setPending({ kind: "image", blob, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this picture.");
    }
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateFile(file, MAX_BYTES);
    setError(problem);
    if (!problem) setPending({ kind: "file", file });
  }

  const canSend = !sending && (Boolean(draft.trim()) || Boolean(pending));

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const attachment: Attachment | undefined =
        pending?.kind === "image"
          ? { kind: "image", blob: pending.blob }
          : pending?.kind === "file"
            ? { kind: "file", file: pending.file }
            : undefined;
      await onSend(draft, attachment);
      setDraft("");
      setPending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={send}
      className="glass fixed inset-x-0 bottom-0 z-20 border-x-0 border-b-0 pb-[calc(env(safe-area-inset-bottom)+8px)]"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 pt-2">
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        {pending && (
          <div className="relative w-fit max-w-full">
            {pending.kind === "image" ? (
              /* eslint-disable-next-line @next/next/no-img-element -- local preview */
              <img
                src={pending.url}
                alt="Picture to send"
                className="h-20 w-auto max-w-40 rounded-xl object-cover"
              />
            ) : (
              <span className="bg-surface flex min-w-0 items-center gap-2.5 rounded-xl py-2 pr-4 pl-2">
                <span className="bg-brand text-brand-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">
                    {pending.file.name}
                  </span>
                  <span className="text-muted block text-[13px]">
                    {formatFileSize(pending.file.size)}
                  </span>
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setPending(null)}
              aria-label={pending.kind === "image" ? "Remove picture" : "Remove file"}
              className="bg-foreground/80 text-background absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        )}
        <div className="flex items-end gap-1">
          <input
            ref={imageInput}
            type="file"
            accept="image/*"
            onChange={pickImage}
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
          <input
            ref={fileInput}
            type="file"
            accept={FILE_ACCEPT}
            onChange={pickFile}
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label="Add file"
            className="text-brand flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 active:opacity-60"
          >
            <Paperclip className="size-[22px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => imageInput.current?.click()}
            aria-label="Add picture"
            className="text-brand -ml-1 flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 active:opacity-60"
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
            placeholder={placeholder}
            className="border-border bg-surface focus-visible:outline-brand mr-1 max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-[22px] border px-4 py-2.5 text-base focus-visible:outline-2"
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
  );
}
