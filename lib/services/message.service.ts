import {
  fileTypeOf,
  MAX_DEMO_FILE_BYTES,
  MAX_FILE_BYTES,
  safeFileName,
  validateFile,
} from "@/lib/messages/attachments";
import { validateMessage } from "@/lib/messages/messages";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { Message, MessageFile, MessageService } from "@/types/messages";
import { hasSession } from "./user.service";

const MESSAGES_KEY = "messages";
/** Private bucket: <sender id>/<recipient id>/<message id>.jpg, readable only by those two. */
const IMAGE_BUCKET = "message-images";
/** Private bucket: <sender id>/<recipient id>/<message id>/<file name>, readable only by those two. */
const FILE_BUCKET = "message-files";
/** How long a picture or file link stays valid; the chat reloads long before that. */
const SIGNED_URL_SECONDS = 60 * 60;

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(blob);
  });
}
const listeners = new Set<() => void>();

// Messages saved before pictures and files existed lack those fields.
const loadLocal = () =>
  readJSON<Message[]>(MESSAGES_KEY, []).map((m) => ({
    ...m,
    imageUrl: m.imageUrl ?? null,
    file: m.file ?? null,
  }));
function saveLocal(messages: Message[]) {
  writeJSON(MESSAGES_KEY, messages);
  listeners.forEach((listener) => listener());
}
const between = (m: Message, a: string, b: string) =>
  (m.senderId === a && m.recipientId === b) || (m.senderId === b && m.recipientId === a);

/** Demo mode: messages live in this browser (switch demo accounts to "reply"). */
const localMessageService: MessageService = {
  async listMine(userId) {
    return loadLocal()
      .filter((m) => m.senderId === userId || m.recipientId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listThread(userId, otherUserId) {
    return loadLocal()
      .filter((m) => between(m, userId, otherUserId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async send(userId, otherUserId, body, attachment) {
    const problem =
      validateMessage(body, Boolean(attachment)) ??
      (attachment?.kind === "file" ? validateFile(attachment.file, MAX_DEMO_FILE_BYTES) : null);
    if (problem) throw new Error(problem);
    // No file storage in demo mode: pictures and files are kept as data URLs.
    const message: Message = {
      id: crypto.randomUUID(),
      senderId: userId,
      recipientId: otherUserId,
      body: body.trim(),
      imageUrl: attachment?.kind === "image" ? await toDataUrl(attachment.blob) : null,
      file:
        attachment?.kind === "file"
          ? {
              url: await toDataUrl(attachment.file),
              name: attachment.file.name,
              size: attachment.file.size,
              type: fileTypeOf(attachment.file)!,
            }
          : null,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    saveLocal([...loadLocal(), message]);
    // The browser's storage is small; if it was full, nothing was saved.
    if (attachment && !loadLocal().some((m) => m.id === message.id))
      throw new Error("Demo storage is full. Clear old chats or send a smaller file.");
    return message;
  },
  async markRead(userId, otherUserId) {
    const now = new Date().toISOString();
    const all = loadLocal();
    if (!all.some((m) => m.recipientId === userId && m.senderId === otherUserId && !m.readAt))
      return;
    saveLocal(
      all.map((m) =>
        m.recipientId === userId && m.senderId === otherUserId && !m.readAt
          ? { ...m, readAt: now }
          : m,
      ),
    );
  },
  onChange(_userId, listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** One row of `messages` (see supabase/migrations). */
interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  image_path: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  read_at: string | null;
}

/** Signed links for the given paths in one request; files download under their own name. */
async function signedUrls(bucket: string, paths: (string | null)[], download = false) {
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

/** Turns rows into messages; picture and file paths become short-lived signed links. */
async function rowsToMessages(rows: MessageRow[]): Promise<Message[]> {
  const [images, files] = await Promise.all([
    signedUrls(
      IMAGE_BUCKET,
      rows.map((r) => r.image_path),
    ),
    signedUrls(
      FILE_BUCKET,
      rows.map((r) => r.file_path),
      true,
    ),
  ]);
  const toFile = (row: MessageRow): MessageFile | null => {
    const url = row.file_path ? files.get(row.file_path) : undefined;
    return url
      ? {
          url,
          name: row.file_name ?? "File",
          size: row.file_size ?? 0,
          type: row.file_type ?? "application/octet-stream",
        }
      : null;
  };
  return rows.map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    imageUrl: row.image_path ? (images.get(row.image_path) ?? null) : null,
    file: toFile(row),
    createdAt: row.created_at,
    readAt: row.read_at,
  }));
}

function fail(error: { message: string }): never {
  throw new Error(error.message);
}

/** Accounts mode: the `messages` table. RLS only lets the two people in a chat read it. */
const supabaseMessageService: MessageService = {
  async listMine(userId) {
    if (!(await hasSession())) return [];
    const { data, error } = await getSupabase()
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) fail(error);
    return rowsToMessages(data as MessageRow[]);
  },
  async listThread(userId, otherUserId) {
    const { data, error } = await getSupabase()
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),` +
          `and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`,
      )
      .order("created_at", { ascending: true })
      .limit(300);
    if (error) fail(error);
    return rowsToMessages(data as MessageRow[]);
  },
  async send(userId, otherUserId, body, attachment) {
    const problem =
      validateMessage(body, Boolean(attachment)) ??
      (attachment?.kind === "file" ? validateFile(attachment.file, MAX_FILE_BYTES) : null);
    if (problem) throw new Error(problem);

    // Upload first, so the message never points to a missing file.
    const id = crypto.randomUUID();
    const folder = `${userId}/${otherUserId}/${id}`;
    let columns: Partial<MessageRow> = {};
    let uploaded: { bucket: string; path: string } | null = null;
    if (attachment?.kind === "image") {
      const path = `${folder}.jpg`;
      const { error } = await getSupabase()
        .storage.from(IMAGE_BUCKET)
        .upload(path, attachment.blob, { contentType: "image/jpeg" });
      if (error) throw new Error("Could not upload the picture. Please try a smaller one.");
      uploaded = { bucket: IMAGE_BUCKET, path };
      columns = { image_path: path };
    } else if (attachment?.kind === "file") {
      const { file } = attachment;
      const type = fileTypeOf(file)!;
      const path = `${folder}/${safeFileName(file.name)}`;
      const { error } = await getSupabase()
        .storage.from(FILE_BUCKET)
        .upload(path, file, { contentType: type });
      if (error) throw new Error("Could not upload the file. Please try again.");
      uploaded = { bucket: FILE_BUCKET, path };
      columns = { file_path: path, file_name: file.name, file_size: file.size, file_type: type };
    }

    const { data, error } = await getSupabase()
      .from("messages")
      .insert({
        id,
        sender_id: userId,
        recipient_id: otherUserId,
        body: body.trim(),
        // Attachment columns only when there is one, so text works even before the migrations.
        ...columns,
      })
      .select("*")
      .single();
    if (error) {
      if (uploaded) await getSupabase().storage.from(uploaded.bucket).remove([uploaded.path]);
      fail(error);
    }
    const [message] = await rowsToMessages([data as MessageRow]);
    return message;
  },
  async markRead(userId, otherUserId) {
    const { error } = await getSupabase()
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", userId)
      .eq("sender_id", otherUserId)
      .is("read_at", null);
    if (error) fail(error);
  },
  onChange(userId, listener) {
    const channel = getSupabase()
      .channel(`messages:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, listener)
      .subscribe();
    return () => void getSupabase().removeChannel(channel);
  },
};

export const messageService: MessageService =
  AUTH_MODE === "accounts" ? supabaseMessageService : localMessageService;
