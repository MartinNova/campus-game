import type { Metadata } from "next";
import { DeadlinesView } from "@/components/deadlines/DeadlinesView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Deadlines & Payments" };

export default function DeadlinesPage() {
  return (
    <>
      <PageHeader
        title="Deadlines & Payments"
        subtitle="Never miss a tuition instalment again."
        backHref="/study"
      />
      <DeadlinesView />
    </>
  );
}
