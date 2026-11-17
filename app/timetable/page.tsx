import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Timetable" };

// Placeholder for a later module. Replace this page on branch feature/timetable.
export default function TimetablePage() {
  return (
    <>
      <PageHeader title="Timetable" subtitle="Your classes and deadlines in one place." />
      <ComingSoon branch="feature/timetable" />
    </>
  );
}
