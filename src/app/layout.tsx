import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ChatWidget />
        <TelegramButton />
      </body>
    </html>
  );
}
