import type { Metadata } from "next";
import { RoomsView } from "@/components/rooms/RoomsView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Rooms & flats" };

export default function RoomsPage() {
  return (
    <>
      <PageHeader
        title="Rooms & flats"
        subtitle="Find a room near campus or pass yours on when you leave."
        backHref="/campus"
      />
      <RoomsView />
    </>
  );
}
