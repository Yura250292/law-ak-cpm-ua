import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Адмін-панель | Адвокат Кабаль Анастасія",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
