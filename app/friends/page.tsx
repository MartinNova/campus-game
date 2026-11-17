import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Friends" };

// Placeholder for a later module. Replace this page on branch feature/friends.
export default function FriendsPage() {
  return (
    <>
      <PageHeader title="Friends" subtitle="See who is free and meet up on campus." />
      <ComingSoon branch="feature/friends" />
    </>
  );
}
