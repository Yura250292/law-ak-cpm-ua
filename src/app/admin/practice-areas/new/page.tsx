"use client";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PracticeAreaForm } from "@/components/admin/PracticeAreaForm";

export default function NewPracticeAreaPage() {
  return (
    <AdminPageShell title="Новий напрямок">
      <PracticeAreaForm />
    </AdminPageShell>
  );
}
