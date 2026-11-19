/**
 * Direct messages between two students.
 * Implement `MessageService` in lib/services/message.service.ts.
 */

export const MAX_MESSAGE_LENGTH = 1000;

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  /** Text; may be empty when the message is a picture. */
  body: string;
  /** Picture to show (signed URL, or a data URL in demo mode); null = text only. */
  imageUrl: string | null;
  /** ISO timestamp. */
  createdAt: string;
  /** When the recipient opened the chat; null = unread. */
  readAt: string | null;
}

/** One chat in the inbox: the other person and the latest message. */
export interface Conversation {
  otherUserId: string;
  last: Message;
  /** Messages from the other person you haven't read yet. */
  unread: number;
}

export interface MessageService {
  /** Your latest messages (sent and received), newest first. */
  listMine(userId: string): Promise<Message[]>;
  /** The chat between you and one other person, oldest first. */
  listThread(userId: string, otherUserId: string): Promise<Message[]>;
  /** Sends text, a picture (already resized JPEG), or both. */
  send(userId: string, otherUserId: string, body: string, image?: Blob): Promise<Message>;
  /** Marks everything the other person sent you as read. */
  markRead(userId: string, otherUserId: string): Promise<void>;
  /** Calls `listener` when a message to or from you arrives. Returns an unsubscribe function. */
  onChange(userId: string, listener: () => void): () => void;
}
