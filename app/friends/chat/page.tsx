import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatView } from "@/components/messages/ChatView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" backHref="/friends/messages" />
      {/* The other person comes from ?u=username, which is read in the browser. */}
      <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
        <ChatView />
      </Suspense>
    </>
  );
}
