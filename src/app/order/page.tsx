import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderForm } from "@/components/OrderForm";

export const metadata: Metadata = {
  title: "ثبت سفارش | کیانت",
  description: "سفارش خدمات کافی‌نت آنلاین کیانت را ثبت کنید و کد رهگیری دریافت کنید.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
          ثبت سفارش آنلاین
        </span>
        <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight text-[var(--ink)]">
          سفارشتو ثبت کن، ما انجامش می‌دیم
        </h1>
      </div>
      <Suspense fallback={<div className="text-center text-sm text-[var(--ink-dim)]">در حال بارگذاری...</div>}>
        <OrderForm />
      </Suspense>
    </div>
  );
}
