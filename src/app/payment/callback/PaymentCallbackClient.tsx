"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet, ShoppingBag } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

interface PaymentCallbackClientProps {
  status: string | null;
  refId: string | null;
  type: string | null;
  error: string | null;
}

export default function PaymentCallbackClient({ status, refId, type, error }: PaymentCallbackClientProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const title = isSuccess ? "پرداخت موفق" : isFailed ? "پرداخت ناموفق" : "در حال پردازش";
  const Icon = isSuccess ? CheckCircle2 : isFailed ? XCircle : Loader2;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isSuccess ? "bg-emerald-400/15 text-emerald-300" : isFailed ? "bg-red-400/15 text-red-300" : "bg-white/10 text-[var(--ink-dim)]"}`}>
          <Icon size={32} className={!isSuccess && !isFailed ? "animate-spin" : ""} />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-[var(--ink)]">{title}</h1>

        {isSuccess && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[var(--ink-dim)]">پرداخت با موفقیت انجام شد.</p>
            {refId && <p className="font-mono text-xs text-emerald-300">شناسه پرداخت: {refId}</p>}
            <p className="text-xs text-[var(--ink-dim)]">
              {type === "WALLET_CHARGE" ? "موجودی کیف پول شما شارژ شد." : "سفارش شما پرداخت شد."}
            </p>
          </div>
        )}

        {isFailed && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-red-300">پرداخت تکمیل نشد.</p>
            {error && <p className="text-xs text-[var(--ink-dim)]">{decodeURIComponent(error)}</p>}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={type === "ORDER_PAYMENT" ? "/orders" : "/wallet"}
            className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
          >
            {type === "ORDER_PAYMENT" ? <ShoppingBag size={16} /> : <Wallet size={16} />}
            {type === "ORDER_PAYMENT" ? "مشاهده سفارشات" : "مشاهده کیف پول"}
            <ArrowLeft size={14} />
          </Link>
          <Link href="/" className="btn-glass rounded-xl px-5 py-3 text-sm font-medium text-[var(--ink)]">
            صفحه اصلی
          </Link>
        </div>

        {isSuccess && countdown > 0 && (
          <p className="mt-4 text-xs text-[var(--ink-dim)]">انتقال خودکار تا {countdown} ثانیه...</p>
        )}
      </GlassCard>
    </div>
  );
}
