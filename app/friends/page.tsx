import type { Metadata } from "next";
import { FriendsView } from "@/components/friends/FriendsView";
import { MessagesLink } from "@/components/messages/MessagesLink";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Friends" };

export default function FriendsPage() {
  return (
    <>
      <PageHeader title="Friends" subtitle="Find other Nova students and get in touch." />
      <MessagesLink />
      <FriendsView />
    </>
  );
}
