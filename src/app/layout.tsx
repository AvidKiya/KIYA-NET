import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { BackgroundScene } from "@/components/BackgroundScene";
import { CMSProvider } from "@/components/cms/CMSContext";
import { LiveEditToggle } from "@/components/cms/LiveEditToggle";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-vazir", display: "swap" });

export const metadata: Metadata = {
  title: "کیانت | KIYA NET — کافی‌نت آنلاین",
  description: "پلتفرم خدمات اینترنتی و کافی‌نت آنلاین کیانت: ثبت‌نام ثنا، کنکور، امور مالیاتی، وام، طراحی گرافیک و چاپ حرفه‌ای — ۲۴ ساعته آنلاین و غیرحضوری.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "کیا نت" },
  other: { "mobile-web-app-capable": "yes" },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
        <CMSProvider>
          <BackgroundScene />
          <div className="grain" />
          <div className="relative flex min-h-dvh flex-col">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
          <LiveEditToggle />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </CMSProvider>
      </body>
    </html>
  );
}
