import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { WeeklyMenu } from "@/components/canteen/WeeklyMenu";
import { getCanteenMenu } from "@/lib/services/canteen.service";

export const metadata: Metadata = { title: "Canteen" };
async function MenuContent() {
  // Evaluate Lisbon dates and freshness per request, not at build time.
  await connection();
  const result = await getCanteenMenu();
  return <WeeklyMenu result={result} />;
}
export default function CanteenPage() {
  return (
    <>
      <PageHeader title="Canteen" subtitle="Explore a Monday–Friday example menu." />
      <Suspense
        fallback={
          <p role="status" className="text-muted">
            Loading the demo menu…
          </p>
        }
      >
        <MenuContent />
      </Suspense>
    </>
  );
}
