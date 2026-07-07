import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { BackgroundScene } from "@/components/BackgroundScene";

const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-vazir", display: "swap" });

export const metadata: Metadata = {
  title: "کیانت | KIYA NET — کافی‌نت آنلاین",
  description: "پلتفرم خدمات اینترنتی و کافی‌نت آنلاین کیانت: ثبت‌نام ثنا، کنکور، امور مالیاتی، وام، طراحی گرافیک و چاپ حرفه‌ای — ۲۴ ساعته آنلاین و غیرحضوری.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "کیا نت" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#21F1A8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const themeScript = `(function(){try{var s=localStorage.getItem('kiya-theme');document.documentElement.setAttribute('data-theme',s==='light'||s==='dark'?s:'dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" className={vazirmatn.variable}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="font-[family-name:var(--font-vazir)] antialiased selection:bg-emerald-400/30 overscroll-none">
        <BackgroundScene />
        <div className="grain" />
        <div className="relative flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
