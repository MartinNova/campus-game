import type { Metadata } from "next";
import { NewGroupView } from "@/components/groups/NewGroupView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "New group" };

export default function NewGroupPage() {
  return (
    <>
      <PageHeader title="New group" backHref="/friends/messages" />
      <NewGroupView />
    </>
  );
}
