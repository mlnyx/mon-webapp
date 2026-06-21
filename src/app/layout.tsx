import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "나의 가계부",
  description: "개인 가계부 · 소비 통계 · 예산 코치",
  manifest: "/mon-webapp/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "가계부",
  },
  icons: {
    apple: "/mon-webapp/icons/apple-touch-icon.png",
    icon: "/mon-webapp/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#13151a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// 초기 테마 적용(깜빡임 방지) — 저장값 없으면 다크 기본
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
