/**
 * Shared by direct messages and group chats: reading attachments for demo mode,
 * signed links and uploads for accounts mode.
 */
import { fileTypeOf, safeFileName } from "@/lib/messages/attachments";
import { getSupabase } from "@/lib/supabase/client";
import type { Attachment, MessageFile } from "@/types/messages";

/** Pictures: private bucket, JPEG only. */
export const IMAGE_BUCKET = "message-images";
/** Files: private bucket (PDF, Office, text, ZIP). */
export const FILE_BUCKET = "message-files";
/** How long a picture or file link stays valid; chats reload long before that. */
export const SIGNED_URL_SECONDS = 60 * 60;

export function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(blob);
  });
}

/** Demo mode: the attachment as data URLs (there is no file storage). */
export async function attachmentToLocal(
  attachment: Attachment | undefined,
): Promise<{ imageUrl: string | null; file: MessageFile | null }> {
  if (attachment?.kind === "image")
    return { imageUrl: await toDataUrl(attachment.blob), file: null };
  if (attachment?.kind === "file") {
    const { file } = attachment;
    return {
      imageUrl: null,
      file: {
        url: await toDataUrl(file),
        name: file.name,
        size: file.size,
        type: fileTypeOf(file)!,
      },
    };
  }
  return { imageUrl: null, file: null };
}

/** Signed links for the given paths in one request; `download` makes files save under their name. */
export async function signedUrls(
  bucket: string,
  paths: (string | null | undefined)[],
  download = false,
): Promise<Map<string, string>> {
  const wanted = paths.filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();
  if (wanted.length === 0) return urls;
  const { data } = await getSupabase()
    .storage.from(bucket)
    .createSignedUrls(wanted, SIGNED_URL_SECONDS, download ? { download: true } : undefined);
  for (const item of data ?? [])
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  return urls;
}

/** Columns describing an uploaded attachment (same names in `messages` and `group_messages`). */
export interface AttachmentColumns {
  image_path?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

/**
 * Uploads an attachment into `folder` (no trailing slash). Returns the row columns and an
 * `undo` that removes the upload again if saving the message fails.
 */
export async function uploadAttachment(
  folder: string,
  attachment: Attachment | undefined,
): Promise<{ columns: AttachmentColumns; undo: () => Promise<void> }> {
  const storage = getSupabase().storage;
  if (attachment?.kind === "image") {
    const path = `${folder}.jpg`;
    const { error } = await storage
      .from(IMAGE_BUCKET)
      .upload(path, attachment.blob, { contentType: "image/jpeg" });
    if (error) throw new Error("Could not upload the picture. Please try a smaller one.");
    return {
      columns: { image_path: path },
      undo: async () => void (await storage.from(IMAGE_BUCKET).remove([path])),
    };
  }
  if (attachment?.kind === "file") {
    const { file } = attachment;
    const type = fileTypeOf(file)!;
    const path = `${folder}/${safeFileName(file.name)}`;
    const { error } = await storage.from(FILE_BUCKET).upload(path, file, { contentType: type });
    if (error) throw new Error("Could not upload the file. Please try again.");
    return {
      columns: { file_path: path, file_name: file.name, file_size: file.size, file_type: type },
      undo: async () => void (await storage.from(FILE_BUCKET).remove([path])),
    };
  }
  return { columns: {}, undo: async () => {} };
}

/** Builds the `file` of a message from its row and the signed links. */
export function fileFromRow(
  row: {
    file_path: string | null;
    file_name: string | null;
    file_size: number | null;
    file_type: string | null;
  },
  urls: Map<string, string>,
): MessageFile | null {
  const url = row.file_path ? urls.get(row.file_path) : undefined;
  return url
    ? {
        url,
        name: row.file_name ?? "File",
        size: row.file_size ?? 0,
        type: row.file_type ?? "application/octet-stream",
      }
    : null;
}
