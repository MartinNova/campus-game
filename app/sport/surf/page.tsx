import type { Metadata } from "next";
import { SurfView } from "@/components/sport/surf/SurfView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Surf" };

export default function SurfPage() {
  return (
    <>
      <PageHeader
        title="Surf"
        subtitle="Forecast and surf schools near Lisbon."
        backHref="/sport"
      />
      <SurfView />
    </>
  );
}
