import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Surf" };

// Placeholder. Build on branch feature/surf; contract in types/surf.ts.
export default function SurfPage() {
  return (
    <>
      <PageHeader title="Surf" subtitle="Wave and wind forecast near Lisbon." backHref="/sport" />
      <ComingSoon branch="feature/surf">
        3-day forecast for Carcavelos, Costa da Caparica, Guincho and Ericeira.
      </ComingSoon>
    </>
  );
}
