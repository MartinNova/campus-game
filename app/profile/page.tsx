import type { Metadata } from "next";
import { MyAreaView } from "@/components/profile/MyAreaView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Your area" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Your area" />
      <MyAreaView />
    </>
  );
}
