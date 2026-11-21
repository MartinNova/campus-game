/**
 * Shared by direct messages and group chats (accounts mode): emoji reactions and deleting.
 */
import { getSupabase } from "@/lib/supabase/client";
import type { Reaction } from "@/types/messages";
import { FILE_BUCKET, IMAGE_BUCKET } from "./chat-files";

type ReactionTable = "message_reactions" | "group_message_reactions";

/** Reactions for the given messages, by message id. Empty if reactions aren't set up yet. */
export async function loadReactions(
  table: ReactionTable,
  messageIds: string[],
): Promise<Map<string, Reaction[]>> {
  const byMessage = new Map<string, Reaction[]>();
  if (messageIds.length === 0) return byMessage;
  const { data } = await getSupabase()
    .from(table)
    .select("message_id, user_id, emoji")
    .in("message_id", messageIds)
    .order("created_at", { ascending: true });
  for (const row of (data ?? []) as { message_id: string; user_id: string; emoji: string }[]) {
    const list = byMessage.get(row.message_id) ?? [];
    list.push({ userId: row.user_id, emoji: row.emoji });
    byMessage.set(row.message_id, list);
  }
  return byMessage;
}

/**
 * Sets (or with null removes) your reaction to a message.
 * Remove-then-add instead of an upsert: an upsert needs the right to change every column
 * (message and person too), but the database only lets you change your emoji.
 */
export async function saveReaction(
  table: ReactionTable,
  messageId: string,
  userId: string,
  emoji: string | null,
) {
  const removed = await getSupabase()
    .from(table)
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId);
  if (removed.error) throw new Error(removed.error.message);
  if (!emoji) return;
  const added = await getSupabase()
    .from(table)
    .insert({ message_id: messageId, user_id: userId, emoji });
  if (added.error) throw new Error(added.error.message);
}

/** Deletes your own message and then its picture or file. */
export async function deleteMessage(
  table: "messages" | "group_messages",
  messageId: string,
  userId: string,
) {
  const { data, error } = await getSupabase()
    .from(table)
    .delete()
    .eq("id", messageId)
    .eq("sender_id", userId)
    .select("image_path, file_path");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("You can only delete your own messages.");
  const { image_path, file_path } = data[0] as {
    image_path: string | null;
    file_path: string | null;
  };
  // The message is gone either way; a leftover upload is only wasted space.
  const storage = getSupabase().storage;
  if (image_path) await storage.from(IMAGE_BUCKET).remove([image_path]);
  if (file_path) await storage.from(FILE_BUCKET).remove([file_path]);
}
