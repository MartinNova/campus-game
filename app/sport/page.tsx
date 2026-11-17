import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SPORT_MODULES } from "@/lib/config/navigation";

export const metadata: Metadata = { title: "Sport" };

export default function SportPage() {
  return (
    <>
      <PageHeader title="Sport" subtitle="Play, surf and train with other Nova students." />
      <div className="grid gap-3">
        {SPORT_MODULES.map(({ href, label, description, icon: Icon, status }) => (
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
