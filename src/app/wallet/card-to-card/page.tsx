"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, Upload, ArrowLeft, Loader2, CheckCircle2, CreditCard, Copy } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { useCMS } from "@/components/cms/CMSContext";

export default function CardToCardPage() {
  const { data } = useCMS();
  const s = data.siteSettings;
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const cardNumber = s.bankCardNumber || "۶۲۱۹۸۶۱۹۱۸۶۹۳۴۱۶";
  const cardHolder = s.bankCardHolder || "رسول محمدی کیا";
  const bankName = s.bankName || "سامان / بلو بانک";

  const copyCard = () => {
    const digits = cardNumber.replace(/[^۰-۹0-9]/g, "");
    navigator.clipboard.writeText(digits).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const submit = async () => {
    if (!amount || Number(amount) < 1000) {
      setMsg("حداقل مبلغ ۱۰۰۰ تومان است");
      return;
    }
    if (!file) {
      setMsg("لطفاً تصویر رسید را انتخاب کنید");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("receipt", file);
      const res = await fetch("/api/wallet/receipt", { method: "POST", body: formData });
      const d = await res.json();
      if (d.success) {
        setAmount("");
        setFile(null);
        setMsg("رسید ارسال شد. پس از تأیید ادمین، موجودی شما شارژ می‌شود.");
      } else {
        setMsg(d.error || "خطا");
      }
    } catch {
      setMsg("خطا در ارسال رسید");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
        <Link href="/wallet" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به کیف پول
        </Link>

        <h1 className="mb-6 text-xl font-extrabold text-[var(--ink)]">پرداخت کارت به کارت</h1>

        <GlassCard className="mb-4 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
            <CreditCard size={18} className="text-emerald-300" />
            کارت بانکی کیانت
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-5 text-[var(--ink)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--ink-dim)]">{bankName}</span>
              <button onClick={copyCard} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                {copied ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-4 font-mono text-lg tracking-widest" dir="ltr">{cardNumber}</p>
            <p className="mt-2 text-sm">{cardHolder}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)]">ارسال رسید</h3>
          <ol className="space-y-2 text-xs leading-6 text-[var(--ink-dim)] list-decimal pr-4">
            <li>مبلغ موردنظر را به شماره کارت بالا واریز کنید.</li>
            <li>تصویر رسید یا تراکنش را ذخیره کنید.</li>
            <li>مبلغ و تصویر رسید را در فرم زیر وارد کنید.</li>
            <li>پس از تأیید ادمین، موجودی شما شارژ می‌شود.</li>
          </ol>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="مبلغ واریز شده (تومان)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left"
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm text-[var(--ink-dim)] hover:border-emerald-400/50">
            <Upload size={18} />
            <span>{file ? file.name : "انتخاب تصویر رسید"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
            ارسال رسید
          </button>

          {msg && (
            <p className={`text-xs ${msg.includes("شارژ") || msg.includes("ارسال شد") ? "text-emerald-300" : "text-red-400"}`}>
              {msg}
            </p>
          )}
        </GlassCard>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
