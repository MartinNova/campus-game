import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Canteen" };

// Placeholder for a later module. Replace this page on branch feature/canteen.
export default function CanteenPage() {
  return (
    <>
      <PageHeader title="Canteen" subtitle="Today's menu at the Nova SBE canteen." />
      <ComingSoon branch="feature/canteen" />
    </>
  );
}
