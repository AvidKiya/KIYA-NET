"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Gamepad2, Coffee, ArrowLeft, Loader2, ExternalLink, Clock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

const GAMES = [
  { id: "memory", title: "حافظه", color: "bg-violet-500/15 text-violet-400" },
  { id: "reaction", title: "واکنش", color: "bg-amber-400/15 text-amber-400" },
  { id: "quiz", title: "آزمون", color: "bg-blue-400/15 text-blue-400" },
  { id: "puzzle", title: "پازل", color: "bg-emerald-400/15 text-emerald-300" },
];

export default function WaitingRoomPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => { if (d.items) setItems(d.items.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleString("fa-IR", { month: "short", day: "numeric" }); } catch { return d; }
  };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 pb-28">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Coffee size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">اتاق انتظار</h1>
            <p className="text-xs text-[var(--ink-dim)]">اخبار بخوانید، بازی کنید و امتیاز جمع‌آوری کنید</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                <Newspaper size={16} className="text-emerald-300" /> آخرین اخبار
              </div>
              <Link href="/news" className="text-xs text-[var(--ink-dim)] hover:text-emerald-300">همه اخبار</Link>
            </div>
            {loading ? (
              <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-300" /></div>
            ) : items.length === 0 ? (
              <p className="text-sm text-[var(--ink-dim)]">خبری یافت نشد.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="rounded-xl bg-white/5 p-3">
                    <a href={item.link} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[var(--ink)] leading-relaxed">{item.title}</p>
                      <ExternalLink size={12} className="shrink-0 text-[var(--ink-dim)]" />
                    </a>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--ink-dim)]">
                      <Clock size={10} /> {fmtDate(item.pubDate)} — {item.source}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                <Gamepad2 size={16} className="text-emerald-300" /> بازی‌ها
              </div>
              <Link href="/games" className="text-xs text-[var(--ink-dim)] hover:text-emerald-300">همه بازی‌ها</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className={`flex items-center justify-center rounded-xl p-4 text-sm font-bold text-[var(--ink)] ${g.color}`}>
                  {g.title}
                </Link>
              ))}
            </div>
            <Link href="/games/leaderboard" className="btn-glass mt-3 flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-medium text-[var(--ink)]">
              لیدربورد و امتیازات
            </Link>
          </GlassCard>
        </div>

        <Link href="/" className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold">
          <ArrowLeft size={16} /> بازگشت به صفحه اصلی
        </Link>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
