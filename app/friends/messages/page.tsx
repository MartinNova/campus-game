import type { Metadata } from "next";
import { InboxView } from "@/components/messages/InboxView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" backHref="/friends" />
      <InboxView />
    </>
  );
}
