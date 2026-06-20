import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나의 가계부",
  description: "개인 가계부 · 소비 통계 · 예산 플래너",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
