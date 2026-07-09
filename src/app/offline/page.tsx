"use client";

import Link from "next/link";
import { WifiOff, RefreshCcw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="glass rounded-3xl p-10 max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
          <WifiOff size={40} className="text-emerald-300" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-[var(--ink)]">شما آفلاین هستید</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-dim)]">
          اتصال اینترنت شما قطع شده است. برخی صفحات و اطلاعات قبلی قابل مشاهده‌اند، اما برای ثبت سفارش یا پرداخت نیاز به اینترنت دارید.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-brand flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold"
          >
            <RefreshCcw size={16} />
            تلاش مجدد
          </button>
          <Link href="/" className="btn-glass rounded-2xl py-3 text-sm font-medium text-[var(--ink)]">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
