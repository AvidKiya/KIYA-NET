import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackgroundScene } from "@/components/BackgroundScene";

const vazirmatn = localFont({
  src: [
    { path: "../fonts/Vazirmatn-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Vazirmatn-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Vazirmatn-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "کیانت | KIYA NET — کافی‌نت آنلاین اوید کیا",
  description:
    "کافی‌نت آنلاین کیانت (KIYA NET): تایپ، پرینت و اسکن مجازی، ثبت‌نام‌های اینترنتی، طراحی، ترجمه و تحویل فایل PDF نهایی، بدون نیاز به مراجعه حضوری.",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('kiya-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" className={vazirmatn.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-vazir antialiased selection:bg-emerald-400/30">
        <BackgroundScene />
        <div className="grain" />
        <div className="relative flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
