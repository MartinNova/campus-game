import { Download } from "lucide-react";
import { fileLabel, formatFileSize } from "@/lib/messages/attachments";
import type { MessageFile } from "@/types/messages";

/** A file in a chat bubble: type, name and size. Tapping downloads (or opens) it. */
export function FileCard({ file, mine }: { file: MessageFile; mine: boolean }) {
  return (
    <a
      href={file.url}
      download={file.name}
      target="_blank"
      rel="noreferrer"
      className={`focus-visible:outline-brand flex min-w-56 items-center gap-3 rounded-[14px] py-2 pr-3 pl-2 transition focus-visible:outline-2 active:opacity-70 ${
        mine ? "bg-white/12" : "bg-background"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold tracking-wide ${
          mine ? "text-brand bg-white" : "bg-brand text-brand-foreground"
        }`}
      >
        {fileLabel(file.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{file.name}</span>
        <span className={`block text-[13px] ${mine ? "opacity-80" : "text-muted"}`}>
          {formatFileSize(file.size)}
        </span>
      </span>
      <Download className="size-5 shrink-0 opacity-80" aria-hidden />
      <span className="sr-only">Download</span>
    </a>
  );
}
