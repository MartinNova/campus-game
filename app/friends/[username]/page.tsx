import type { Metadata } from "next";
import { Suspense } from "react";
import { FriendProfileView } from "@/components/friends/FriendProfileView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Profile" };

export default function FriendProfilePage() {
  return (
    <>
      <PageHeader title="Profile" backHref="/friends" />
      {/* The username comes from the URL and is read in the browser. */}
      <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
        <FriendProfileView />
      </Suspense>
    </>
  );
}
