import type { Metadata } from "next";
import { TodoView } from "@/components/study/TodoView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "To-dos" };

export default function TodosPage() {
  return (
    <>
      <PageHeader
        title="To-dos"
        subtitle="Plan your uni work for the day, the week or the month."
        backHref="/study"
      />
      <TodoView />
    </>
  );
}
