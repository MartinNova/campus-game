import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupInfoView } from "@/components/groups/GroupInfoView";

export const metadata: Metadata = { title: "Group info" };

export default function GroupInfoPage() {
  return (
    // The group comes from ?id=…; the view renders its own header with the back link.
    <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
      <GroupInfoView />
    </Suspense>
  );
}
