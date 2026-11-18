import { validateMessage } from "@/lib/messages/messages";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { Message, MessageService } from "@/types/messages";
import { hasSession } from "./user.service";

const MESSAGES_KEY = "messages";
const listeners = new Set<() => void>();

const loadLocal = () => readJSON<Message[]>(MESSAGES_KEY, []);
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
  async send(userId, otherUserId, body) {
    const problem = validateMessage(body);
    if (problem) throw new Error(problem);
    const message: Message = {
      id: crypto.randomUUID(),
      senderId: userId,
      recipientId: otherUserId,
      body: body.trim(),
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
  created_at: string;
  read_at: string | null;
}

const rowToMessage = (row: MessageRow): Message => ({
  id: row.id,
  senderId: row.sender_id,
  recipientId: row.recipient_id,
  body: row.body,
  createdAt: row.created_at,
  readAt: row.read_at,
});

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
    return (data as MessageRow[]).map(rowToMessage);
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
    return (data as MessageRow[]).map(rowToMessage);
  },
  async send(userId, otherUserId, body) {
    const problem = validateMessage(body);
    if (problem) throw new Error(problem);
    const { data, error } = await getSupabase()
      .from("messages")
      .insert({ sender_id: userId, recipient_id: otherUserId, body: body.trim() })
      .select("*")
      .single();
    if (error) fail(error);
    return rowToMessage(data as MessageRow);
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
