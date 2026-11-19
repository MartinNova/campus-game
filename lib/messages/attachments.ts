/**
 * Files in chats (PDFs, slides, spreadsheets …). Pictures go through the image path instead,
 * so they show inline; everything else is a file card you can download.
 */

/** Upload limit with real accounts (matches the `message-files` bucket). */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** Demo mode keeps files in the browser's small storage, so they must stay tiny. */
export const MAX_DEMO_FILE_BYTES = 1024 * 1024;

/** File types students actually send each other. Must match the bucket's allowed types. */
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/zip": "zip",
};

/** For the file picker's `accept` attribute. */
export const FILE_ACCEPT = Object.values(ALLOWED_FILE_TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

/** Some browsers leave the type empty or vague (e.g. .csv on Windows): fall back to the extension. */
export function fileTypeOf(file: { name: string; type: string }): string | null {
  if (file.type in ALLOWED_FILE_TYPES) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Object.entries(ALLOWED_FILE_TYPES).find(([, e]) => e === ext)?.[0] ?? null;
}

/** Returns an error message, or null if the file can be sent. */
export function validateFile(
  file: { name: string; type: string; size: number },
  maxBytes: number,
): string | null {
  if (!fileTypeOf(file))
    return "This file type can't be sent. Try PDF, Word, Excel, PowerPoint, text or ZIP.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > maxBytes) return `Files can be at most ${formatFileSize(maxBytes)}.`;
  return null;
}

/** "820 B", "14 KB", "2.3 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Upper-case extension for the file card, e.g. "PDF". */
export function fileLabel(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return (ext || "FILE").toUpperCase().slice(0, 4);
}

/**
 * Storage keys only allow a safe set of characters. Keeps the extension and a readable name,
 * e.g. "Übung 3 (final).pdf" → "_bung_3__final_.pdf".
 */
export function safeFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
  return (cleaned || "file").slice(-100);
}
