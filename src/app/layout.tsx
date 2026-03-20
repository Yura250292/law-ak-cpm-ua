import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Юридичні послуги онлайн | Генерація документів",
    template: "%s | Юридичні послуги",
  },
  description:
    "Професійна підготовка юридичних документів онлайн. Позовні заяви, договори та інші документи з використанням AI.",
  keywords: [
    "юрист",
    "адвокат",
    "позовна заява",
    "юридичні послуги",
    "онлайн документи",
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
