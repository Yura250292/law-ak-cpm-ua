import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import TelegramButton from "@/components/TelegramButton";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Адвокат Кабаль Анастасія | Юридичні послуги онлайн | Львів",
    template: "%s | Адвокат Кабаль Анастасія",
  },
  description:
    "Адвокат Кабаль Анастасія Ігорівна — юридичні послуги у Львові. Сімейне, цивільне, господарське та адміністративне право. Підготовка документів онлайн.",
  keywords: [
    "адвокат Львів",
    "Кабаль Анастасія",
    "адвокат",
    "позовна заява",
    "юридичні послуги",
    "сімейне право",
    "цивільне право",
    "господарське право",
  ],
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ChatWidget />
        <TelegramButton />
      </body>
    </html>
  );
}
