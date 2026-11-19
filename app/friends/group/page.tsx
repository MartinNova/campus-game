import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupChatView } from "@/components/groups/GroupChatView";

export const metadata: Metadata = { title: "Group" };

export default function GroupChatPage() {
  return (
    // The group comes from ?id=…; the view renders its own header with the group's name.
    <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
      <GroupChatView />
    </Suspense>
  );
}
