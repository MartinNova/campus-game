import type { Metadata } from "next";
import { CampusLinkCard } from "@/components/campus/CampusLinkCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { CAMPUS_LINK_SECTIONS } from "@/data/campus-links";

export const metadata: Metadata = { title: "Campus" };

export default function CampusPage() {
  return (
    <>
      <PageHeader
        title="Campus"
        subtitle="Getting here, rooms & flats, library, campus map and restaurants."
      />
      <div className="space-y-6">
        {CAMPUS_LINK_SECTIONS.map((section) => (
          <section key={section.title} aria-label={section.title}>
            <h2 className="text-muted mb-3 text-sm font-semibold tracking-wide uppercase">
              {section.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.links.map((link) => (
                <CampusLinkCard key={link.id} link={link} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
