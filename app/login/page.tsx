import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Welcome" subtitle="Sign in or create your account." />
      {/* AuthForm reads ?login_error=..., which needs a Suspense boundary. */}
      <Suspense fallback={<div className="bg-border h-80 animate-pulse rounded-2xl" />}>
        <AuthForm />
      </Suspense>
    </>
  );
}
