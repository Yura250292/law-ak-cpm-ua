"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  PracticeAreaForm,
  type PracticeAreaData,
} from "@/components/admin/PracticeAreaForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPracticeAreaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [initial, setInitial] = useState<PracticeAreaData | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/content/practice-areas/${id}`);
      if (res.status === 401) return router.push("/admin/login");
      const data = await res.json();
      const it = data.item;
      setInitial({
        title: it.title,
        slug: it.slug,
        shortDescription: it.shortDescription,
        icon: it.icon,
        description: it.description,
        services: it.services,
        advantages: it.advantages,
        process: it.process ?? [],
        status: it.status,
        sortOrder: it.sortOrder,
      });
    })();
  }, [id, router]);

  return (
    <AdminPageShell title="Редагування напрямку">
      {initial ? (
        <PracticeAreaForm id={id} initial={initial} />
      ) : (
        <p className="text-muted">Завантаження…</p>
      )}
    </AdminPageShell>
  );
}
