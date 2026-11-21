import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Set up your profile" };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader title="Welcome!" subtitle="Three quick steps and you're ready." />
      <OnboardingFlow />
    </>
  );
}
