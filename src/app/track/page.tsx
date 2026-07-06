import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackOrder } from "@/components/TrackOrder";

export const metadata: Metadata = {
  title: "پیگیری سفارش | کیانت",
  description: "وضعیت سفارش خود را در کافی‌نت آنلاین کیانت پیگیری کنید و فایل نهایی را دانلود کنید.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
          پیگیری سفارش
        </span>
        <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight text-[var(--ink)]">
          سفارشت الان کجاست؟
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--ink-dim)]">
          کد رهگیری‌ای که موقع ثبت سفارش دریافت کردی رو وارد کن تا وضعیت و فایل نهایی رو ببینی.
        </p>
      </div>
      <Suspense fallback={<div className="text-center text-sm text-[var(--ink-dim)]">در حال بارگذاری...</div>}>
        <TrackOrder />
      </Suspense>
    </div>
  );
}
