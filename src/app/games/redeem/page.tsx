"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, CheckCircle2, Copy } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

const TIERS = [
  { points: 1000, discountPercent: 5 },
  { points: 2500, discountPercent: 10 },
  { points: 5000, discountPercent: 15 },
  { points: 10000, discountPercent: 20 },
];

export default function RedeemPage() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/games/leaderboard?me=true")
      .then((r) => r.json())
      .then((d) => { setPoints(d.points || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function redeem(index: number) {
    setError("");
    setCode("");
    try {
      const res = await fetch("/api/games/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierIndex: index }),
      });
      const d = await res.json();
      if (d.success) {
        setCode(d.code);
        setDiscount(d.discountPercent);
        setPoints(d.remainingPoints);
      } else {
        setError(d.error || "خطا");
      }
    } catch {
      setError("خطا در تبدیل امتیاز");
    }
  }

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
        <Link href="/games" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به بازی‌ها
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Gift size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">تبدیل امتیاز به کد تخفیف</h1>
            <p className="text-xs text-[var(--ink-dim)]">امتیاز کسب‌شده را به کد تخفیف تبدیل کنید</p>
          </div>
        </div>

        <GlassCard className="mb-4 p-6 text-center">
          <p className="text-sm text-[var(--ink-dim)]">امتیاز فعلی شما</p>
          <p className="text-3xl font-extrabold text-emerald-300">{loading ? "..." : points.toLocaleString("fa-IR")}</p>
        </GlassCard>

        <div className="grid gap-3 sm:grid-cols-2">
          {TIERS.map((tier, i) => (
            <GlassCard key={tier.points} className={`p-5 ${points >= tier.points ? "" : "opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--ink)]">تخفیف {tier.discountPercent}٪</p>
                  <p className="text-xs text-[var(--ink-dim)]">{tier.points.toLocaleString("fa-IR")} امتیاز</p>
                </div>
                <button
                  onClick={() => redeem(i)}
                  disabled={points < tier.points}
                  className="btn-brand rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  تبدیل
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {code && (
          <GlassCard className="mt-4 p-5 text-center">
            <p className="text-sm text-[var(--ink-dim)]">کد تخفیف {discount}٪ شما</p>
            <div className="mx-auto mt-3 flex max-w-xs items-center justify-between rounded-2xl bg-white/5 px-5 py-3">
              <span className="font-mono text-lg font-bold tracking-wider text-emerald-300">{code}</span>
              <button onClick={copy} className="btn-glass flex h-9 w-9 items-center justify-center rounded-full">
                {copied ? <CheckCircle2 size={15} className="text-emerald-300" /> : <Copy size={15} />}
              </button>
            </div>
          </GlassCard>
        )}
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
