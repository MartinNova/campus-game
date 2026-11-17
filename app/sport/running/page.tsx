import type { Metadata } from "next";
import { RunningView } from "@/components/sport/running/RunningView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Running" };

export default function RunningPage() {
  return (
    <>
      <PageHeader
        title="Running"
        subtitle="Join a run club or post your own run."
        backHref="/sport"
      />
      <RunningView />
    </>
  );
}
