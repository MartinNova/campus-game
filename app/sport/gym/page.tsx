import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Gym" };

// Placeholder. Build on branch feature/gym; contract in types/gym.ts.
export default function GymPage() {
  return (
    <>
      <PageHeader title="Gym" subtitle="Locations, opening hours and classes." backHref="/sport" />
      <ComingSoon branch="feature/gym">Mock data only until real data usage is cleared.</ComingSoon>
    </>
  );
}
