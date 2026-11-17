import type { Metadata } from "next";
import { GettingThereView } from "@/components/transport/GettingThereView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Getting to campus" };

export default function GettingHerePage() {
  return (
    <>
      <PageHeader
        title="Getting to campus"
        subtitle="Map, Uber and the next trains from Carcavelos and Oeiras."
        backHref="/campus"
      />
      <GettingThereView />
    </>
  );
}
