"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  PackageCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { formatToman, formatJalaliDateTime, statusLabel, toPersianDigits } from "@/lib/format";

const STEPS: { key: string; label: string; icon: typeof Sparkles }[] = [
  { key: "pending", label: "در انتظار بررسی", icon: Clock3 },
  { key: "accepted", label: "در حال انجام", icon: Sparkles },
  { key: "completed", label: "آماده تحویل", icon: PackageCheck },
  { key: "delivered", label: "تحویل شد", icon: CheckCircle2 },
];

type OrderDetails = {
  trackingCode: string;
  categoryTitle: string;
  serviceTitle: string;
  fullName: string;
  status: string;
  estimatedPrice: number;
  description: string;
  quantity: number;
  urgent: boolean;
  createdAt: string;
  deliveredAt: string | null;
  hasAttachment: boolean;
};

export function TrackOrder() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder(trackingCode: string) {
    if (!trackingCode.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trackingCode.trim())}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "سفارشی با این کد پیدا نشد.");
        return;
      }
      setOrder(json.order);
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("code")) {
      fetchOrder(searchParams.get("code") ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    fetchOrder(code);
  }

  const isCancelled = order?.status === "cancelled";
  const activeStepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="glass flex items-center gap-2 rounded-2xl p-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="کد رهگیری خود را وارد کنید (مثال: KIYA-A1B2C3)"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)]"
        />
        <button type="submit" className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          پیگیری
        </button>
      </form>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} />
          {error}
        </div>
      ) : null}

      {order ? (
        <GlassCard className="mt-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--ink-dim)]">کد رهگیری</p>
              <p className="font-mono text-lg font-bold text-emerald-300">{order.trackingCode}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-[var(--ink-dim)]">مبلغ سفارش</p>
              <p className="text-lg font-bold text-[var(--ink)]">{formatToman(order.estimatedPrice)}</p>
            </div>
          </div>

          <div className="my-6 border-t border-white/10" />

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p className="text-[var(--ink-dim)]">
              مشتری: <span className="text-[var(--ink)]">{order.fullName}</span>
            </p>
            <p className="text-[var(--ink-dim)]">
              خدمت: <span className="text-[var(--ink)]">{order.serviceTitle}</span>
            </p>
            <p className="text-[var(--ink-dim)]">
              دسته‌بندی: <span className="text-[var(--ink)]">{order.categoryTitle}</span>
            </p>
            <p className="text-[var(--ink-dim)]">
              تعداد: <span className="text-[var(--ink)]">{toPersianDigits(order.quantity)}</span>
            </p>
            <p className="text-[var(--ink-dim)]">
              تاریخ ثبت: <span className="text-[var(--ink)]">{formatJalaliDateTime(new Date(order.createdAt))}</span>
            </p>
            {order.urgent ? <p className="font-bold text-amber-400">سفارش فوری</p> : null}
          </div>

          {isCancelled ? (
            <div className="mt-6 rounded-2xl bg-red-400/10 px-5 py-4 text-sm text-red-300">
              این سفارش لغو شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                {STEPS.map((step, i) => {
                  const done = i <= activeStepIndex;
                  return (
                    <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                          done
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                            : "border-white/15 text-[var(--ink-dim)]"
                        }`}
                      >
                        <step.icon size={16} />
                      </div>
                      <p className={`mt-2 text-[10px] sm:text-xs ${done ? "text-[var(--ink)]" : "text-[var(--ink-dim)]"}`}>
                        {step.label}
                      </p>
                      {i < STEPS.length - 1 ? (
                        <div className={`mt-[-28px] h-0.5 w-full translate-x-1/2 ${i < activeStepIndex ? "bg-emerald-400" : "bg-white/10"}`} style={{ marginTop: "-28px" }} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`/api/orders/${order.trackingCode}/document?type=receipt`}
              target="_blank"
              rel="noreferrer"
              className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-[var(--ink)] sm:text-sm"
            >
              <FileText size={15} />
              دانلود رسید سفارش
            </a>
            {order.status === "completed" || order.status === "delivered" ? (
              <a
                href={`/api/orders/${order.trackingCode}/document?type=delivery`}
                target="_blank"
                rel="noreferrer"
                className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold sm:text-sm"
              >
                <PackageCheck size={15} />
                دانلود فایل PDF تحویلی
              </a>
            ) : (
              <span className="text-xs text-[var(--ink-dim)]">فایل نهایی پس از تکمیل سفارش قابل دانلود است.</span>
            )}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
