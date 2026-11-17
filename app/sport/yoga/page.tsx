import type { Metadata } from "next";
import { YogaClassList } from "@/components/sport/yoga/YogaClassList";
import { YogaInfo } from "@/components/sport/yoga/YogaInfo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Yoga" };

export default function YogaPage() {
  return (
    <>
      <PageHeader
        title="Yoga"
        subtitle="Classes on campus by the student club Nova MindSpace."
        backHref="/sport"
      />
      <YogaClassList />
      <YogaInfo />
      <p className="text-muted mt-4 text-xs">
        Snapshot of the club&apos;s weekly schedule. Times can change or classes can be cancelled,
        so check the current schedule before you go.
      </p>
    </>
  );
}
