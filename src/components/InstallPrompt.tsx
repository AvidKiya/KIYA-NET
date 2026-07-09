"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[90] max-w-xs animate-rise">
      <div className="glass-strong rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">نصب اپلیکیشن کیا نت</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-dim)]">
              با نصب روی صفحه اصلی، سریع‌تر به کافی‌نت آنلاین دسترسی داشته باشید.
            </p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-[var(--ink-dim)] hover:text-[var(--ink)]">
            <X size={16} />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="btn-brand mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold"
        >
          <Download size={14} />
          نصب اپلیکیشن
        </button>
      </div>
    </div>
  );
}
