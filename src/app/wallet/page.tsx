"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, Plus, CreditCard, Banknote, Loader2, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState<"zarinpal" | "payping" | "test">("test");
  const [charging, setCharging] = useState(false);
  const [msg, setMsg] = useState("");

  const loadData = () => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch("/api/wallet/transactions").then(r => r.json()).then(d => { if (d.transactions) setTxs(d.transactions); }).catch(() => {});
  };
  useEffect(() => { loadData(); }, []);

  const fmt = (p: string) => Number(p || 0).toLocaleString("fa-IR");
  const fd = (d: string) => new Date(d).toLocaleDateString("fa-IR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const balance = user?.walletBalance || "0";

  const chargeGateway = async () => {
    if (!amount || Number(amount) < 1000) { setMsg("حداقل ۱۰۰۰ تومان"); return; }
    setCharging(true); setMsg("");
    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "WALLET_CHARGE", amount: Number(amount), gateway, description: "شارژ کیف پول" }),
      });
      const d = await res.json();
      if (d.success && d.paymentUrl) {
        window.location.href = d.paymentUrl;
      } else {
        setMsg(d.error || "خطا در ایجاد درخواست پرداخت");
      }
    } catch { setMsg("خطا در اتصال"); }
    finally { setCharging(false); }
  };

  return <><SiteHeader/>
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28 space-y-4">
      <GlassCard className="text-center p-8">
        <Wallet size={36} className="mx-auto text-emerald-300" />
        <p className="mt-4 text-sm text-[var(--ink-dim)]">موجودی کیف پول</p>
        <h2 className="mt-2 text-4xl font-extrabold text-emerald-300">{fmt(balance)}<span className="mr-2 text-lg font-normal text-emerald-400/70">تومان</span></h2>
      </GlassCard>

      {/* Charge section */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--ink)]">افزایش موجودی</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { v: "zarinpal", l: "زرین‌پال", i: CreditCard },
            { v: "payping", l: "پی‌پینگ", i: CreditCard },
            { v: "test", l: "تست", i: CreditCard },
          ].map(m => <button key={m.v} onClick={() => setGateway(m.v as any)} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all ${gateway === m.v ? "bg-emerald-400/15 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}><m.i size={16} />{m.l}</button>)}
        </div>
        <div className="flex gap-2">
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="مبلغ به تومان" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
          <button onClick={chargeGateway} disabled={charging} className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60">{charging ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} پرداخت</button>
        </div>
        <Link href="/wallet/card-to-card" className="btn-glass flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--ink)]">
          <Banknote size={16} /> پرداخت کارت به کارت <ExternalLink size={12} />
        </Link>
        {msg && <p className={`text-xs ${msg.includes("خطا") || msg.includes("حداقل") ? "text-red-400" : "text-emerald-300"}`}>{msg}</p>}
      </GlassCard>

      {/* Transactions */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-[var(--ink)]">تاریخچه تراکنش‌ها</h3><span className="text-[11px] text-[var(--ink-dim)]">{txs.length} تراکنش</span></div>
        {txs.length === 0 ? <p className="text-xs text-[var(--ink-dim)] text-center py-4">تراکنشی ثبت نشده</p> :
          <div className="space-y-2">
            {txs.slice(0, 10).map((tx: any) => <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {Number(tx.amount) > 0 ? <ArrowDownLeft size={14} className="text-emerald-300" /> : <ArrowUpRight size={14} className="text-red-300" />}
                <div><p className="text-xs text-[var(--ink)]">{tx.description || (Number(tx.amount) > 0 ? "شارژ" : "پرداخت")}</p><p className="text-[10px] text-[var(--ink-dim)]">{fd(tx.createdAt)}</p></div>
              </div>
              <span className={`text-xs font-bold ${Number(tx.amount) > 0 ? "text-emerald-300" : "text-red-300"}`}>{Number(tx.amount) > 0 ? "+" : ""}{fmt(tx.amount)} تومان</span>
            </div>)}
          </div>
        }
      </GlassCard>
    </div>
    <SiteFooter/><BottomNav/>
  </>;
}
