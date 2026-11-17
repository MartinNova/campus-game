import type { Metadata } from "next";
import { Cherry } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Açaí Natura · Food Options" };
export default function AcaiNaturaPage() {
  return (
    <>
      <PageHeader title="Açaí Natura" subtitle="Açaí bowls & smoothies" backHref="/canteen" />
      <Card className="space-y-4 p-6 sm:p-8">
        <span className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-2xl">
          <Cherry className="size-7" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold">Discover your next campus treat</h2>
        <p className="text-muted leading-relaxed">
          Visit Açaí Natura on campus to explore the menu. An official menu link for this location
          has not yet been verified.
        </p>
        <p className="text-muted text-sm">
          Please check current options, prices and allergen information with the team in store.
        </p>
      </Card>
    </>
  );
}
