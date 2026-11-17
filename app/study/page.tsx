import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { STUDY_MODULES } from "@/lib/config/navigation";

export const metadata: Metadata = { title: "Study Hub" };

export default function StudyHubPage() {
  return (
    <>
      <PageHeader title="Study Hub" subtitle="Your timetable and your uni to-dos in one place." />
      <div className="grid gap-3">
        {STUDY_MODULES.map(({ href, label, description, icon: Icon, status }) => (
          <LinkCard
            key={href}
            href={href}
            title={label}
            description={description}
            icon={<Icon className="size-5" aria-hidden />}
            badge={status === "soon" ? <Badge>Soon</Badge> : null}
          />
        ))}
      </div>
    </>
  );
}
