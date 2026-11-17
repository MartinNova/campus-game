import type { Metadata } from "next";
import { SurfForecastView } from "@/components/sport/surf/SurfForecastView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Surf" };

export default function SurfPage() {
  return (
    <>
      <PageHeader
        title="Surf"
        subtitle="3-day wave and wind forecast near Lisbon."
        backHref="/sport"
      />
      <SurfForecastView />
    </>
  );
}
