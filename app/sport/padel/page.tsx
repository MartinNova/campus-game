import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Padel" };

// Placeholder. Build on branch feature/padel; contract in types/padel.ts.
export default function PadelPage() {
  return (
    <>
      <PageHeader title="Padel" subtitle="Find players for your next match." backHref="/sport" />
      <ComingSoon branch="feature/padel">
        Create matches, filter by date and level, join or leave.
      </ComingSoon>
    </>
  );
}
