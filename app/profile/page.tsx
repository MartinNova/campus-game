import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "@/components/profile/ProfileView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Tell other Nova students who you are." />
      {/* ProfileView reads ?login_error=..., which needs a Suspense boundary. */}
      <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
        <ProfileView />
      </Suspense>
    </>
  );
}
