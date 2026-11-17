import type { Metadata } from "next";
import { PadelView } from "@/components/sport/padel/PadelView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Padel" };

export default function PadelPage() {
  return (
    <>
      <PageHeader title="Padel" subtitle="Find players for your next match." backHref="/sport" />
      <PadelView />
    </>
  );
}
