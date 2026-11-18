import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomDetailView } from "@/components/rooms/RoomDetailView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Listing" };

export default function RoomListingPage() {
  return (
    <>
      <PageHeader title="Listing" backHref="/campus/rooms" />
      {/* The listing id comes from ?id=... and is read in the browser. */}
      <Suspense fallback={<div className="bg-border h-64 animate-pulse rounded-2xl" />}>
        <RoomDetailView />
      </Suspense>
    </>
  );
}
