"use client";

import { usePathname } from "next/navigation";
import TelegramButton from "@/components/TelegramButton";
import ChatWidget from "@/components/ChatWidget";

/**
 * Плаваючі віджети лише для публічної частини сайту.
 * В адмінці вони перекривають інтерфейс, тому там не рендеряться.
 */
export default function PublicWidgets() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <ChatWidget />
      <TelegramButton />
    </>
  );
}
