import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "New password" };

export default function ResetPasswordPage() {
  return (
    <>
      <PageHeader title="New password" subtitle="Almost done: pick a new password." />
      <ResetPasswordForm />
    </>
  );
}
