import { validateMessage } from "@/lib/messages/messages";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { Message, MessageService } from "@/types/messages";
import { hasSession } from "./user.service";

const MESSAGES_KEY = "messages";
/** Private bucket: <sender id>/<recipient id>/<message id>.jpg, readable only by those two. */
const IMAGE_BUCKET = "message-images";
/** How long a picture link stays valid; the chat reloads long before that. */
const SIGNED_URL_SECONDS = 60 * 60;

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the picture."));
    reader.readAsDataURL(blob);
  });
}
const listeners = new Set<() => void>();

// Messages saved before pictures existed have no imageUrl yet.
const loadLocal = () =>
  readJSON<Message[]>(MESSAGES_KEY, []).map((m) => ({ ...m, imageUrl: m.imageUrl ?? null }));
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
  async send(userId, otherUserId, body, image) {
    const problem = validateMessage(body, Boolean(image));
    if (problem) throw new Error(problem);
    const message: Message = {
      id: crypto.randomUUID(),
      senderId: userId,
      recipientId: otherUserId,
      body: body.trim(),
      // No file storage in demo mode: the (resized) picture is kept as a data URL.
      imageUrl: image ? await toDataUrl(image) : null,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    saveLocal([...loadLocal(), message]);
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
  created_at: string;
  read_at: string | null;
}

/** Turns rows into messages; picture paths become short-lived signed links (one request). */
async function rowsToMessages(rows: MessageRow[]): Promise<Message[]> {
  const paths = rows.map((r) => r.image_path).filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await getSupabase()
      .storage.from(IMAGE_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    for (const item of data ?? [])
      if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return rows.map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    imageUrl: row.image_path ? (urls.get(row.image_path) ?? null) : null,
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
  async send(userId, otherUserId, body, image) {
    const problem = validateMessage(body, Boolean(image));
    if (problem) throw new Error(problem);

    // Picture first, so the message never points to a missing file.
    const id = crypto.randomUUID();
    const bucket = getSupabase().storage.from(IMAGE_BUCKET);
    const imagePath = image ? `${userId}/${otherUserId}/${id}.jpg` : null;
    if (image && imagePath) {
      const { error } = await bucket.upload(imagePath, image, { contentType: "image/jpeg" });
      if (error) throw new Error("Could not upload the picture. Please try a smaller one.");
    }

    const { data, error } = await getSupabase()
      .from("messages")
      .insert({
        id,
        sender_id: userId,
        recipient_id: otherUserId,
        body: body.trim(),
        // Only sent with a picture, so text messages keep working before the migration is run.
        ...(imagePath ? { image_path: imagePath } : {}),
      })
      .select("*")
      .single();
    if (error) {
      if (imagePath) await bucket.remove([imagePath]);
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
